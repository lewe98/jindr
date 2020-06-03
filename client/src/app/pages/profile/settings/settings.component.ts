import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: User = new User();
  constructor(
    public modalCtrl: ModalController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
  }

  close() {
    this.modalCtrl.dismiss();
  }

  logout() {
    this.authService.logOut().then(() => {
      this.close();
    });
  }

  async presentEmailPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Change Email',
      inputs: [
        {
          name: 'email',
          placeholder: 'Email...',
          value: this.user.email,
          type: 'email'
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
            this.user.email = data.email;
            this.authService
              .updateUser(this.user)
              .then(() => {
                this.toastService.presentToast('Email changed.');
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

  async presentPasswordPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password...',
          type: 'password'
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
            this.authService
              .updateUser(this.user, data.password)
              .then(() => {
                this.toastService.presentToast('Password changed.');
              })
              .catch((err) => {
                this.toastService.presentWarningToast(
                  err.errors.password,
                  'Error!'
                );
              });
          }
        }
      ]
    });
    await alert.present();
  }
}
