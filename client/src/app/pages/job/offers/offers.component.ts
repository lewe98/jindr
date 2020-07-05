import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { JobService } from '../../../services/Job/job.service';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { Subscription } from 'rxjs';

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
  subscriptions: Subscription[] = [];
  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    this.jobService.getJobs(this.user._id);
    this.subscriptions.push(
      this.jobService.$allJobs.subscribe((sub) => {
        this.allJobs = sub;
        this.allJobs.forEach((job) => {
          this.finishedOffers = [];
          this.activeOffers = [];
          if (job.isFinished) {
            this.finishedOffers.push(job);
          } else {
            this.activeOffers.push(job);
          }
        });
      })
    );
  }

  search() {}

  segmentChanged(ev): void {
    this.segmentValue = ev.detail.value;
  }
}
