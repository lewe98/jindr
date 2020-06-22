import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  loading;
  constructor(
    public toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

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

  async presentNotification(header, message, link) {
    const notification = await this.toastController.create({
      header,
      message,
      duration: 3000,
      position: 'top',
      animated: true,
      cssClass: 'custom-notification',
      buttons: [
        {
          side: 'end',
          text: 'View',
          icon: 'arrow-forward-sharp',
          handler: () => {
            if (link) {
              this.router.navigate([link]);
            }
          }
        }
      ]
    });
    notification.present();
  }

  /**
   * Call this method to display a loading animation
   * @param message to be displayed on the loading animation
   */
  async presentLoading(message) {
    this.loading = await this.loadingController.create({
      message,
      duration: 20000
    });
    await this.loading.present();
  }

  /**
   * Call this method to dismiss the loading animation
   */
  dismissLoading() {
    this.loading.dismiss();
  }
}
