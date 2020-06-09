import { EventEmitter, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from '../Toast/toast.service';
import { LoadingController } from '@ionic/angular';

const { Geolocation } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  wait;
  loadingElement: any;
  location: string;
  geocoder = new google.maps.Geocoder();
  currentPosition: Coords;
  public $mapReady: EventEmitter<any> = new EventEmitter();
  coords: Coords = { lat: 50.05, lng: 8.8 };
  private coordsSubject: BehaviorSubject<Coords> = new BehaviorSubject<Coords>(
    this.coords
  );
  /**
   * Subscribe to this to get live coordinates on location change
   */
  public coordsSubscription = this.coordsSubject.asObservable();
  constructor(
    public ngZone: NgZone,
    private toastService: ToastService,
    private loadingController: LoadingController
  ) {
    this.init();
  }

  async init() {
    await this.createLoader();
    this.$mapReady.emit(true);
    this.watchPosition();
    this.geocodeLatLng();
  }

  /**
   * Method to get the current position as coordinates
   */
  async getCurrentPosition(): Promise<Coords> {
    this.presentLoader();
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentPosition = {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude
      };
      return this.currentPosition;
    } catch (e) {
      this.toastService.presentWarningToast(e, 'Error getting location!');
    } finally {
      this.dismissLoader();
    }
  }

  /**
   * Continuously tracks the current position and updates the coordsSubject with new
   * coordinates on every location change
   */
  watchPosition() {
    this.wait = Geolocation.watchPosition(
      { enableHighAccuracy: true, maximumAge: 300 * 1000 },
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
            this.geocodeLatLng();
          }
        });
      }
    );
  }

  async createLoader() {
    this.loadingElement = await this.loadingController.create({
      message: 'Trying to get your current location...'
    });
  }

  async geocodeLatLng() {
    const coords = await this.getCurrentPosition();
    this.geocoder.geocode({ location: coords }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.location = 'Unknown';
          results[0].address_components.forEach((adr) => {
            if (adr.types[0] === 'locality') {
              this.location = adr.long_name;
            }
          });
        } else {
          this.location = 'Unknown';
        }
      } else {
        this.toastService.presentWarningToast(
          status,
          'Geocoder failed due to: '
        );
      }
    });
  }

  async presentLoader() {
    await this.loadingElement.present();
  }

  async dismissLoader() {
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
    }
  }

  stopTracking() {
    Geolocation.clearWatch({ id: this.wait });
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }

  /**
   * calculates the distance between two coordinates
   * This Calculation is not very accurate, but enough for this use case
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
