import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import {
  Coords,
  LocationService
} from '../../../services/Location/location.service';

@Component({
  selector: 'app-swipe-card',
  templateUrl: './swipe-card.component.html',
  styleUrls: ['./swipe-card.component.scss']
})
export class SwipeCardComponent implements OnInit {
  @Input() data: Job;
  @Input() isPreview = false;
  @Input() coords: Coords;
  @Output() viewInfo = new EventEmitter();
  distance: number;

  constructor(private locationService: LocationService) {}

  ngOnInit() {
    if (this.coords) {
      this.distance = this.locationService.getDistanceFromLatLonInKm(
        this.coords.lat,
        this.coords.lng,
        this.data.location.lat,
        this.data.location.lng
      );
      this.distance = Math.round(this.distance);
    }
  }

  handleViewInfo() {
    this.viewInfo.emit();
  }
}
