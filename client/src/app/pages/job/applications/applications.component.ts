import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';

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
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getUser();
  }

  segmentChanged(ev): void {
    this.segmentValue = ev.detail.value;
  }

  search() {
    this.likedFiltered = this.likedJobs.filter((o) =>
      o.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.acceptedFiltered = this.acceptedJobs.filter((o) =>
      o.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
