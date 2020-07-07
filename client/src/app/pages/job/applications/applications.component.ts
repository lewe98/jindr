import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { JobService } from '../../../services/Job/job.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {
  segmentValue = 'liked';
  searchQuery = '';
  acceptedJobs: Job[] = [];
  likedJobs: Job[] = [];
  likedFiltered: Job[] = [];
  acceptedFiltered: Job[] = [];
  user: User = new User();
  constructor(
    private authService: AuthService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.jobService
      .getLikedAcceptedJobs(this.user?._id)
      .then((data) => {
        this.likedJobs = data.likedJobs.map((o) => Object.assign(new Job(), o));
        this.likedFiltered = this.likedJobs;
        this.acceptedJobs = data.acceptedJobs.map((o) =>
          Object.assign(new Job(), o)
        );
        this.acceptedFiltered = this.acceptedJobs;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  segmentChanged(ev): void {
    this.segmentValue = ev.detail.value;
  }

  /**
   * Method to filter the arrays with a search query
   */
  search() {
    this.likedFiltered = this.likedJobs.filter((o) =>
      o.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.acceptedFiltered = this.acceptedJobs.filter((o) =>
      o.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
