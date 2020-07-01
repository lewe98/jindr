import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController,
  NavController
} from '@ionic/angular';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ProfileResumeComponent } from '../profile-resume/profile-resume.component';
import { AssetService } from '../../../services/Asset/asset.service';
import { Interest } from '../../../../../interfaces/interest';
import { SwipeService } from '../../../services/Swipe/swipe.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  editForm: FormGroup;
  user: User = new User();
  userBirthday = new Date();
  date: Date;
  interests = [];
  userInterests = [];
  tempInterests: Interest[] = [];
  changedInterests = false;

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private router: Router,
    private assetService: AssetService,
    private swipeService: SwipeService
  ) {}

  async ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    this.userBirthday = this.user.dateOfBirth;
    this.tempInterests = this.assetService.getInterests();
    this.interests = this.tempInterests?.map((i) => {
      return i.title;
    });
    this.userInterests = this.user.interest?.map((i) => {
      return i.title;
    });
    this.editForm = new FormGroup({
      firstName: new FormControl(this.user.firstName, Validators.required),
      lastName: new FormControl(this.user.lastName, Validators.required),
      aboutMe: new FormControl(this.user.aboutMe)
    });
  }

  changedInterest() {
    this.changedInterests = true;
  }

  /***
   * Method that saves changed profile contents
   * @modifies the profile contents (dateOfBirth, firstName, lastName, aboutMe, Interests)
   * @throws a subtle success notification if the profile has been changed successfully.
   *         a subtle error notification if the profile has been not changed successfully.
   * @post After successful editing you will be redirected to the profile page.
   * */
  save() {
    this.user.dateOfBirth = new Date(this.userBirthday);
    this.user.firstName = this.editForm.controls.firstName.value;
    this.user.lastName = this.editForm.controls.lastName.value;
    this.user.aboutMe = this.editForm.controls.aboutMe.value;
    if (this.changedInterests) {
      this.user.interest = [];
      this.userInterests.forEach((int) => {
        this.user.interest.push(
          this.tempInterests.find((i) => int === i.title)
        );
      });
    }
    this.authService
      .updateUser(this.user)
      .then(() => {
        if (this.changedInterests) {
          this.swipeService.updateBacklog();
        }
        this.toastService.presentToast('Profile updated.');
        this.router.navigate(['pages/profile']);
      })
      .catch((err) => {
        this.toastService.presentWarningToast(err.errors, 'Error!');
        this.user = this.authService.getUser();
      });
  }
  /* Calls the Curriculum-Component.*/
  async editCurriculum() {
    const modal = await this.modalCtrl.create({
      component: ProfileResumeComponent,
      componentProps: {
        inputUser: this.authService.getUser()
      }
    });
    return await modal.present();
  }
}
