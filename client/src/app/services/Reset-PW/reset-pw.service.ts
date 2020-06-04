import {Injectable} from '@angular/core';
import {AuthService} from '../Auth/auth.service';
import {AlertController, ModalController} from '@ionic/angular';
import {ToastService} from '../Toast/toast.service';

@Injectable({
    providedIn: 'root'
})
export class ResetPwService {

    constructor(
        private authService: AuthService,
        private alertController: AlertController,
        private modalController: ModalController,
        private toastService: ToastService
    ) {}

    close() {
        this.modalController.dismiss();
    }

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
                        this.authService
                            .sendmail(data.email)
                            .then(() => {
                                this.toastService.presentToast('Email has been sent.');
                            })
                            .catch((err) => {
                                this.toastService.presentWarningToast(
                                    JSON.parse(err.errors),
                                    'Error: '
                                );
                            });
                    }
                }
            ]
        });
        await alert.present();
    }
}
