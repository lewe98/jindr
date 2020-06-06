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
  location: string;
  currentPosition: Coords;
  coords: Coords = { lat: 50.05, lng: 8.8 };
  private readonly accessToken: string;
  private httpClient: HttpClient;
  private coordsSubject: BehaviorSubject<Coords> = new BehaviorSubject<Coords>(
    this.coords
  );
  /**
   * Subscribe to this to get live coordinates on location change
   */
  public coordsSubscription = this.coordsSubject.asObservable();
  constructor(public ngZone: NgZone, private handler: HttpBackend) {
    this.accessToken = environment.mapbox.accessToken;
    (mapboxgl as any).accessToken = this.accessToken;
    this.httpClient = new HttpClient(handler);
    this.watchPosition();
    this.getLocationName();
  }

  /**
   * Method to get the current position as coordinates
   */
  async getCurrentPosition(): Promise<Coords> {
    const coordinates = await Geolocation.getCurrentPosition();
    this.currentPosition = {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude
    };
    return this.currentPosition;
  }

  /**
   * Continuously tracks the current position and updates the coordsSubject with new
   * coordinates on every location change
   */
  watchPosition() {
    this.wait = Geolocation.watchPosition(
      { enableHighAccuracy: false, maximumAge: 600 * 1000 },
      (position) => {
        this.ngZone.run(() => {
          this.coordsSubject.next({
            lat: position?.coords.latitude,
            lng: position?.coords.longitude
          });
          /**
           * If user traveled more than 8 kilometers, update current location name
           */
          if (
            this.getDistanceFromLatLonInKm(
              this.currentPosition?.lat,
              this.currentPosition?.lng,
              position?.coords.latitude,
              position?.coords.longitude
            ) > 8
          ) {
            this.getLocationName();
          }
        });
      }
    );
  }

  /**
   * Method to get the name of a city from its coordinates
   * It gets the current coordinates from capacitor geolocation
   * and sends them to the mapbox api to get the city name
   */
  async getLocationName() {
    const coords = await this.getCurrentPosition();
    this.httpClient
      .get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?types=poi&access_token=${this.accessToken}`
      )
      .subscribe((sub) => {
        // tslint:disable-next-line
        this.location = sub['features'][0].context[2].text;
      });
  }

  stopTracking() {
    Geolocation.clearWatch({ id: this.wait });
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }

  /**
   * calculates the distance between two coordinates
   * This Calculation is not perfectly accurate, but enough for this use case
   * @param lat1 origin latitude
   * @param lon1 origin longitude
   * @param lat2 destiantion latitue
   * @param lon2 destination longitude
   * @return calculated distance
   */
  getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

export interface Coords {
  lat: number;
  lng: number;
}
