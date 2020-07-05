import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { JobService } from '../../../services/Job/job.service';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  activeOffers: Job[] = [];
  finishedOffers: Job[] = [];
  allJobs: Job[] = [];
  user: User = new User();
  segmentValue = 'active';
  searchQuery = '';
  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    this.jobService
      .getJobs(this.user._id)
      .then((res) => {
        this.allJobs = res;
        this.allJobs.forEach((job) => {
          if (job.isFinished) {
            this.finishedOffers.push(job);
          } else {
            this.activeOffers.push(job);
          }
        });
        console.log(this.activeOffers);
      })
      .catch((err) => {
        this.toastService.presentWarningToast(err, 'Error!');
      });
  }

  search() {}

  segmentChanged(ev): void {
    this.segmentValue = ev.detail.value;
  }
}
