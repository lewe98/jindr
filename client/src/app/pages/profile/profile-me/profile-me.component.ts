import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { SettingsComponent } from '../settings/settings.component';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';

@Component({
  selector: 'app-profile-me',
  templateUrl: './profile-me.component.html',
  styleUrls: ['./profile-me.component.scss']
})
export class ProfileMeComponent implements OnInit {
  user: User = new User();
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
  }

  goToExplore() {
    this.navCtrl.navigateForward('/explore');
  }

  async viewProfile() {}

  async viewSettings() {
    const modal = await this.modalCtrl.create({
      component: SettingsComponent
    });
    return await modal.present();
  }

  async viewEditProfile() {}
}
