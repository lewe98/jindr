import { Component, OnInit } from '@angular/core';
import { Job } from '../../../../../interfaces/job';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  activeOffers: Job[] = [];
  finishedOffers: Job[] = [];
  segmentValue = 'active';
  searchQuery = '';
  constructor() {}

  ngOnInit() {}

  search() {}

  segmentChanged(ev): void {
    this.segmentValue = ev.detail.value;
  }
}
