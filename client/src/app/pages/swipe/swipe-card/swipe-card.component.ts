import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import {
  Coords,
  LocationService
} from '../../../services/Location/location.service';
import { JobDetailComponent } from '../../job/job-detail/job-detail.component';
import { ModalController, NavController } from '@ionic/angular';

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

  constructor(
    private locationService: LocationService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}

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

  async handleViewInfo() {
    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: { job: this.data }
    });
    return await modal.present();
  }
}
