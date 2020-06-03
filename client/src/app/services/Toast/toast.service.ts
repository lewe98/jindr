import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(public toastController: ToastController) {}

  /**
   * Presents a toast on the top of the screen for 2 sec
   * @param message the message to be displayed
   */
  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'medium',
      position: 'top',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  /**
   * Presents a warning/error toast (yellow) on the top of the screen for 2 sec
   * @param message the message to be displayed
   * @param header the header to be displayed (e.g. Error or Warning)
   */
  async presentWarningToast(message, header) {
    const toast = await this.toastController.create({
      header,
      message,
      color: 'warning',
      duration: 2000,
      position: 'top',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }
}
