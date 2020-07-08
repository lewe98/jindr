import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import { JobService } from '../../../services/Job/job.service';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { JobDetailComponent } from '../job-detail/job-detail.component';
import { ModalController } from '@ionic/angular';

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
    private authService: AuthService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((data) => {
      if (data.data) {
        const job = JSON.parse(data.data);
        this.goToJob(job.job);
      }
    });
    Object.assign(this.user, this.authService.getUser());
    if (this.jobService.allJobs.length === 0) {
      this.jobService.getJobs(this.user._id);
    }
    this.subscriptions.push(
      this.jobService.$allJobs.subscribe((sub) => {
        this.allJobs = sub;
        this.allJobs.sort((a, b) => (a.date < b.date ? -1 : 1));
        this.finishedOffers = [];
        this.activeOffers = [];
        this.allJobs.forEach((job) => {
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

  async goToJob(job) {
    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: { job }
    });
    return await modal.present();
  }
}
