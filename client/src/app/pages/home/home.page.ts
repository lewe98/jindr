import { Component, OnInit } from '@angular/core';
import {SettingsComponent} from '../profile/settings/settings.component';
import {ModalController, NavController} from '@ionic/angular';
import {LocationService} from '../../services/Location/location.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  mapRadius = 11;
  jobs = 14;
  location: string;
  constructor(
      private navCtrl: NavController,
      private modalCtrl: ModalController,
      private locationService: LocationService
  ) {}

  async ngOnInit() {
    this.location = this.locationService.location;
  }

  async viewSettings() {
    const modal = await this.modalCtrl.create({
      component: SettingsComponent,
      componentProps: {
        location: this.location
      }
    });
    return await modal.present();
  }
}
