import { Injectable } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { AlertController, ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ResetPwService {
  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  close() {
    this.modalController.dismiss();
  }

  /**
   * Method to present a prompt to enter an email address
   * calls the 'sendMail(...)' method in auth.service.ts
   */
  async presentEmailPrompt() {
    const alert = await this.alertController.create({
      header: 'Reset password',
      inputs: [
        {
          name: 'email',
          placeholder: 'Email...',
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit',
          handler: (data) => {
            this.authService.sendmail(data.email);
          }
        }
      ]
    });
    await alert.present();
  }
}
