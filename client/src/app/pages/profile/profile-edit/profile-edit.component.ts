import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController,
  NavController
} from '@ionic/angular';
import { CurriculumComponent } from '../curriculum/curriculum.component';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  user: User = new User();
  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
  }

  async editfirstname() {
    const alert = await this.alertCtrl.create({
      header: 'Edit Firstname',
      inputs: [
        {
          name: 'firstName',
          placeholder: 'Firstname...',
          value: this.user.firstName,
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.user.firstName = data.firstName;
            this.authService
              .updateUser(this.user)
              .then(() => {
                this.toastService.presentToast('Firstname changed.');
              })
              .catch((err) => {
                this.toastService.presentWarningToast(
                  err.errors.email,
                  'Error!'
                );
                this.user = this.authService.getUser();
                console.log(this.authService.user);
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async editlastname() {
    const alert = await this.alertCtrl.create({
      header: 'Edit Lastname',
      inputs: [
        {
          name: 'lastName',
          placeholder: 'Lastname...',
          value: this.user.lastName,
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.user.lastName = data.lastName;
            this.authService
              .updateUser(this.user)
              .then(() => {
                this.toastService.presentToast('Lastname changed.');
              })
              .catch((err) => {
                this.toastService.presentWarningToast(
                  err.errors.email,
                  'Error!'
                );
                this.user = this.authService.getUser();
                console.log(this.authService.user);
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async adddateofbirth() {
    const alert = await this.alertCtrl.create({
      header: 'Add Date of Birth',
      inputs: [
        {
          name: 'dateofbirth',
          placeholder: 'Date of Birth...',
          value: this.user.dateofbirth,
          type: 'date'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.user.dateofbirth = data.dateofbirth;
            this.authService
              .updateUser(this.user)
              .then(() => {
                this.toastService.presentToast('Date of birth changed.');
              })
              .catch((err) => {
                this.toastService.presentWarningToast(
                  err.errors.email,
                  'Error!'
                );
                this.user = this.authService.getUser();
                console.log(this.authService.user);
              });
          }
        }
      ]
    });
    await alert.present();
  }
  async adddescription() {
    const alert = await this.alertCtrl.create({
      header: 'Add Description',
      inputs: [
        {
          name: 'description',
          placeholder: 'Description...',
          value: this.user.description,
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.user.description = data.description;
            this.authService
              .updateUser(this.user)
              .then(() => {
                this.toastService.presentToast('Description changed.');
              })
              .catch((err) => {
                this.toastService.presentWarningToast(
                  err.errors.email,
                  'Error!'
                );
                this.user = this.authService.getUser();
                console.log(this.authService.user);
              });
          }
        }
      ]
    });
    await alert.present();
  }
  async editCurriculum() {
    const modal = await this.modalCtrl.create({
      component: CurriculumComponent
    });
    return await modal.present();
  }
}
