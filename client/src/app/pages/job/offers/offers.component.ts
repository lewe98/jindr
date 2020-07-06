import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { JobService } from '../../../services/Job/job.service';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  activeOffers: Job[] = [];
  finishedOffers: Job[] = [];
  activeFiltered: Job[] = [];
  finishedFiltered: Job[] = [];
  allJobs: Job[] = [];
  user: User = new User();
  segmentValue = 'active';
  searchQuery = '';
  subscriptions: Subscription[] = [];
  constructor(
    private jobService: JobService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    if (this.jobService.allJobs.length === 0) {
      this.jobService.getJobs(this.user._id);
    }
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
          this.activeFiltered = this.activeOffers;
          this.finishedFiltered = this.finishedOffers;
        });
      })
    );
  }

  search() {
    this.activeFiltered = this.activeOffers.filter((o) =>
      o.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.finishedFiltered = this.finishedOffers.filter((o) =>
      o.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  segmentChanged(ev): void {
    this.segmentValue = ev.detail.value;
  }
}
