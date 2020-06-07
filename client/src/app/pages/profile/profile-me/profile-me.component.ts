import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { SettingsComponent } from '../settings/settings.component';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ImageService } from '../../../services/Image/image.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { ProfileViewComponent } from '../profile-view/profile-view.component';
import { LocationService } from '../../../services/Location/location.service';

@Component({
  selector: 'app-profile-me',
  templateUrl: './profile-me.component.html',
  styleUrls: ['./profile-me.component.scss']
})
export class ProfileMeComponent implements OnInit {
  user: User = new User();
  location: string;
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private authService: AuthService,
    public imageService: ImageService,
    private toastService: ToastService,
    private locationService: LocationService
  ) {}

  async ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    this.location = this.locationService.location;
  }

  async viewProfile() {
    const modal = await this.modalCtrl.create({
      component: ProfileViewComponent
    });
    return await modal.present();
  }

  async viewSettings() {
    const modal = await this.modalCtrl.create({
      component: SettingsComponent,
      componentProps: {
        location: this.location
      }
    });
    return await modal.present();
  }

  async editPicture() {
    this.imageService
      .getImage('profilePicture')
      .then(async (image) => {
        await this.toastService.presentLoading('Save...');
        this.user.image = image;
        this.authService
          .updateUser(this.user)
          .then(() => {
            Object.assign(this.user, this.authService.getUser());
            this.toastService.dismissLoading();
          })
          .catch((e) => {
            this.toastService.dismissLoading();
            this.toastService.presentWarningToast(e.message, 'Error!');
          });
      })
      .catch((error) => {
        this.toastService.presentWarningToast(error, 'Error!');
      });
  }
}
