import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, PopoverController } from '@ionic/angular';
import { Job } from '../../../../../interfaces/job';
import { AuthService } from '../../../services/Auth/auth.service';
import { AssetService } from '../../../services/Asset/asset.service';
import { Interest } from '../../../../../interfaces/interest';
import { JobService } from '../../../services/Job/job.service';
import { User } from '../../../../../interfaces/user';
import { InfoComponent } from '../info/info.component';

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
