import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { JobService } from '../../../services/Job/job.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-display-jobs',
  templateUrl: './display-jobs.component.html',
  styleUrls: ['./display-jobs.component.scss']
})
export class DisplayJobsComponent implements OnInit {
  user: User = new User();
  jobs: Job[] = [];

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private toastService: ToastService,
    private modalCtrl: ModalController
  ) {
  }

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    this.jobService.getJobs(this.user._id)
      .then((res) => {
        Object.assign(this.jobs, res);
      })
      .catch((err) => {
        this.toastService.presentWarningToast(err, 'Error!');
      });
  }

  async viewProfile() {
    const modal = await this.modalCtrl.create({
      component: ProfileViewComponent,
      componentProps: { user: this.user }
    });
    return await modal.present();
  }

  deleteJob(id: string) {
    this.jobService.deleteJob(id);
  }

}
