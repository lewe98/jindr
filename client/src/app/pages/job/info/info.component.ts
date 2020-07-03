import { Component, Inject, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import { CHAT_VIEW_TOKEN } from '../../chat/chat-view/chat-view-token';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html'
})
export class InfoComponent {
  profile;
  job;
  @Input() public onClick = () => {};
  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    @Inject(CHAT_VIEW_TOKEN) private chatViewComponent
  ) {
    this.profile = this.navParams.get('profile');
    this.job = this.navParams.get('job');
  }

  close() {
    this.onClick();
    this.modalCtrl.dismiss();
  }

  /**
   * Open chat component as modal, using the CHAT_VIEW_TOKEN as workaround
   * to break the cyclic dependency
   */
  async handleChatInfo() {
    const modal = await this.modalCtrl.create({
      component: this.chatViewComponent,
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
