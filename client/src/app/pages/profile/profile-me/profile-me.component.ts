import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { SettingsComponent } from '../settings/settings.component';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ImageService } from '../../../services/Image/image.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { ProfileViewComponent } from '../profile-view/profile-view.component';
import { LocationService } from '../../../services/Location/location.service';
import { Subscription } from 'rxjs';
import { JobService } from '../../../services/Job/job.service';

@Component({
  selector: 'app-profile-me',
  templateUrl: './profile-me.component.html',
  styleUrls: ['./profile-me.component.scss']
})
export class ProfileMeComponent implements OnInit, OnDestroy {
  user: User = new User();
  location: string;
  subscription: Subscription[] = [];
  unreadJobs: number;
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private authService: AuthService,
    public imageService: ImageService,
    private toastService: ToastService,
    private locationService: LocationService,
    private jobService: JobService
  ) {}

  async ngOnInit() {
    this.subscription.push(
      this.authService.user$.subscribe((u) => {
        this.user = u;
      })
    );
    if (this.jobService.allJobs.length === 0) {
      this.jobService.getJobs(this.authService.user._id);
    }
    this.subscription.push(
      this.jobService.unread$.subscribe((s) => {
        this.unreadJobs = s;
        console.log(s);
      })
    );
    this.location = this.locationService.location;
    if (history.state && history.state.location === 'Unknown') {
      this.location = history.state.location;
      this.viewSettings();
    }
  }

  async viewProfile() {
    const modal = await this.modalCtrl.create({
      component: ProfileViewComponent,
      componentProps: { user: this.user }
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
    modal.onDidDismiss().then((res) => {
      this.location = res.data;
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

  ngOnDestroy(): void {
    this.subscription.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
