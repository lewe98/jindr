import { Component, OnInit } from "@angular/core";
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

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  editForm: FormGroup;
  user: User = new User();
  date: Date;
  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    this.editForm = new FormGroup({
      firstName: new FormControl(this.user.firstName, Validators.required),
      lastName: new FormControl(this.user.lastName, Validators.required),
      aboutMe: new FormControl(this.user.aboutMe)
    });
  }

  selectDOB(event) {
    this.date = event.detail.value;

  }
  /* Save the changed user data.*/
  save() {
    this.user.dateOfBirth = new Date(this.date).getTime();
    this.user.firstName = this.editForm.controls.firstName.value;
    this.user.lastName = this.editForm.controls.lastName.value;
    this.user.aboutMe = this.editForm.controls.aboutMe.value;
    console.log(this.user);
    this.authService
      .updateUser(this.user)
      .then(() => {
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
