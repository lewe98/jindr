import { Component, OnDestroy, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { LocationService } from '../../services/Location/location.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/Auth/auth.service';
import { User } from '../../../../interfaces/user';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  map: mapboxgl.Map;
  marker: mapboxgl.Marker;
  style = 'mapbox://styles/mapbox/light-v10';
  lat = 37.75;
  lng = -122.41;
  user: User;
  subscription: Subscription[] = [];
  constructor(
    private locationService: LocationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.user = this.authService.user;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 13,
      center: [this.lng, this.lat]
    });

    this.initPosition();
  }

  initPosition() {
    this.subscription.push(
      this.locationService.coordsSubscription.subscribe((sub) => {
        this.map.setZoom(10);
        this.map.setCenter([sub.lng, sub.lat]);
        this.setMarker(sub.lng, sub.lat);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
  }

  setMarker(lng, lat) {
    const markerStyle = `
    background-image: url(${this.user.image});
    background-size: cover;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
  `;
    const el = document.createElement('div');
    el.className = 'marker';
    el.setAttribute('style', `${markerStyle}`);
    if (this.marker) {
      this.marker.remove();
    }
    this.marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(this.map);
  }
}
