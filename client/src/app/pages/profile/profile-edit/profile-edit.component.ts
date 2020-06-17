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
import { Router } from '@angular/router';
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

  selectDOB(event) {
    this.date = event.detail.value;
  }

  changedInterest() {
    this.changedInterests = true;
  }

  /* Save the changed user data.*/
  save() {
    this.user.dateOfBirth = new Date(this.date).getTime();
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
        this.toastService.presentToast('Profil updated.');
        this.router.navigate(['pages/profile']);
      })
      .catch((err) => {
        this.toastService.presentWarningToast(err.errors.email, 'Error!');
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
