import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../environments/environment';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { HttpBackend, HttpClient } from '@angular/common/http';

const { Geolocation } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  wait;
  coords: Coords = { lat: 50.05, lng: 8.8 };
  private httpClient: HttpClient;
  accessToken;
  private coordsSubject: BehaviorSubject<Coords> = new BehaviorSubject<Coords>(
    this.coords
  );
  public coordsSubscription = this.coordsSubject.asObservable();
  constructor(public ngZone: NgZone, private handler: HttpBackend) {
    this.accessToken = environment.mapbox.accessToken;
    (mapboxgl as any).accessToken = this.accessToken;
    this.httpClient = new HttpClient(handler);
    this.watchPosition();
  }

  async getCurrentPosition(): Promise<Coords> {
    const coordinates = await Geolocation.getCurrentPosition();
    return {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude
    };
  }

  watchPosition() {
    this.wait = Geolocation.watchPosition({}, (position) => {
      this.ngZone.run(() => {
        this.coordsSubject.next({
          lat: position?.coords.latitude,
          lng: position?.coords.longitude
        });
      });
    });
  }

  async getLocationName(): Promise<string> {
    const coords = await this.getCurrentPosition();
    return new Promise<string>((resolve, reject) => {
      this.httpClient
        .get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?types=poi&access_token=${this.accessToken}`
        )
        .subscribe(
          (sub) => {
            // tslint:disable-next-line
            resolve(sub['features'][0].context[2].text);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  stopTracking() {
    Geolocation.clearWatch({ id: this.wait });
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }
}

export interface Coords {
  lat: number;
  lng: number;
}
