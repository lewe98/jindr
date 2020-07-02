import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import { ChatViewComponent } from '../../chat/chat-view/chat-view.component';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html'
})
export class InfoComponent {
  profile;
  job;
  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) {
    this.profile = this.navParams.get('profile');
    this.job = this.navParams.get('job');
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async handleChatInfo() {
    const modal = await this.modalCtrl.create({
      component: ChatViewComponent,
      componentProps: { user: this.profile._id, job: this.job }
    });
    this.close();
    return await modal.present();
  }

  async handleProfileInfo() {
    const modal = await this.modalCtrl.create({
      component: ProfileViewComponent,
      componentProps: { user: this.profile }
    });
    this.close();
    return await modal.present();
  }
}
