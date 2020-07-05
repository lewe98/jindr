import { Component, Input, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { JobService } from '../../../services/Job/job.service';
import { AlertController, ModalController } from '@ionic/angular';
import { JobDetailComponent } from '../job-detail/job-detail.component';
import { User } from '../../../../../interfaces/user';

@Component({
  selector: 'app-display-jobs',
  templateUrl: './display-jobs.component.html',
  styleUrls: ['./display-jobs.component.scss']
})
export class DisplayJobsComponent implements OnInit {
  @Input() job: Job;
  @Input() user: User;

  constructor(
    private jobService: JobService,
    private modalCtrl: ModalController,
    private alertController: AlertController
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
    this.jobService.deleteJob(id, this.user._id);
  }

  async presentConfirm(id: string) {
    const alert = await this.alertController.create({
      cssClass: '',
      header: 'Delete job',
      message: 'Do you really want to <strong>delete</strong> this job?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Okay',
          handler: () => {
            this.deleteJob(id);
          }
        }
      ]
    });
    await alert.present();
  }
}
