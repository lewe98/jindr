import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, PopoverController } from '@ionic/angular';
import { Job } from '../../../../../interfaces/job';
import { AuthService } from '../../../services/Auth/auth.service';
import { AssetService } from '../../../services/Asset/asset.service';
import { Interest } from '../../../../../interfaces/interest';
import { JobService } from '../../../services/Job/job.service';
import { User } from '../../../../../interfaces/user';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import {
  ChatViewComponent,
  PopoverComponent
} from '../../chat/chat-view/chat-view.component';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./styles/job-detail.scss', './styles/job-detail.shell.scss']
})
export class JobDetailComponent implements OnInit {
  data: Job = new Job();
  interests: Interest[] = [];
  interestedUsers: User[] = [];
  constructor(
    private modalCtrl: ModalController,
    public authService: AuthService,
    private navParams: NavParams,
    public assetService: AssetService,
    private jobService: JobService,
    public popoverController: PopoverController
  ) {}

  ngOnInit() {
    if (this.navParams.get('job')) {
      Object.assign(this.data, this.navParams.get('job'));
      this.getInterestedUsers();
    } else {
      this.jobService.getJobById(this.navParams.get('id')).then((job) => {
        Object.assign(this.data, job);
        this.getInterestedUsers();
      });
    }

    Object.assign(this.interests, this.assetService.getInterests());
  }

  getInterestedUsers() {
    if (this.authService.user._id === this.data.creator) {
      this.authService
        .getArrayOfUsers(this.data.interestedUsers)
        .then((res) => {
          this.interestedUsers = res;
        });
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async presentPopover(ev: any, profile) {
    const popover = await this.popoverController.create({
      component: InfoComponent,
      cssClass: 'my-custom-class',
      event: ev,
      showBackdrop: true,
      componentProps: { profile, job: this.data }
    });
    return await popover.present();
  }
}

@Component({
  template: `
    <ion-list>
      <ion-item (click)="handleProfileInfo()">View Profile</ion-item>
      <ion-item (click)="handleChatInfo()">Start Chat</ion-item>
    </ion-list>
  `
})
export class InfoComponent {
  profile;
  job;
  constructor(public modalCtrl: ModalController, public navParams: NavParams) {
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
    return await modal.present();
  }

  async handleProfileInfo() {
    const modal = await this.modalCtrl.create({
      component: ProfileViewComponent,
      componentProps: { user: this.profile }
    });
    return await modal.present();
  }
}
