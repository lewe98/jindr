import { Component, Input, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { JobService } from '../../../services/Job/job.service';
import { ModalController } from '@ionic/angular';
import { JobDetailComponent } from '../job-detail/job-detail.component';

@Component({
  selector: 'app-display-jobs',
  templateUrl: './display-jobs.component.html',
  styleUrls: ['./display-jobs.component.scss']
})
export class DisplayJobsComponent implements OnInit {
  @Input() job: Job;

  constructor(
    private jobService: JobService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}

  async viewJob() {
    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: { job: this.job }
    });
    return await modal.present();
  }

  deleteJob(id: string) {
    this.jobService.deleteJob(id);
  }
}
