import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Job } from '../../../../../interfaces/job';
import {
  Coords,
  LocationService
} from '../../../services/Location/location.service';
import { JobDetailComponent } from '../../job/job-detail/job-detail.component';
import { ModalController, NavController } from '@ionic/angular';
import { AuthService } from '../../../services/Auth/auth.service';

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
  description;
  name;

  constructor(
    private locationService: LocationService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private authService: AuthService
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
    this.description = this.data?.description.substring(0, 100) + '...';
    this.authService.getUserByID(this.data?.creator).then((res) => {
      this.name = res.firstName + ' ' + res.lastName.charAt(0) + '.';
    });
  }

  async handleViewInfo() {
    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: { job: this.data }
    });
    return await modal.present();
  }
}
