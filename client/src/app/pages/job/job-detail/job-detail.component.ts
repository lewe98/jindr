import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Job } from '../../../../../interfaces/job';
import { AuthService } from '../../../services/Auth/auth.service';
import { AssetService } from '../../../services/Asset/asset.service';
import { Interest } from '../../../../../interfaces/interest';
import { JobService } from '../../../services/Job/job.service';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {
  data: Job = new Job();
  interests: Interest[] = [];
  constructor(
    private modalCtrl: ModalController,
    public authService: AuthService,
    private navParams: NavParams,
    public assetService: AssetService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    if (this.navParams.get('job')) {
      Object.assign(this.data, this.navParams.get('job'));
    } else {
      this.jobService.getJobById(this.navParams.get('id')).then((job) => {
        Object.assign(this.data, job);
      });
    }

    Object.assign(this.interests, this.assetService.getInterests());
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
