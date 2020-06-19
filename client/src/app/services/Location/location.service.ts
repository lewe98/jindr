import { EventEmitter, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from '../Toast/toast.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../Auth/auth.service';
import { User } from '../../../../interfaces/user';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

const { Geolocation } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  wait;
  loadingElement: any;
  location = 'unknown';
  geocoder = new google.maps.Geocoder();
  currentPosition: Coords;
  private httpClient: HttpClient;
  public $mapReady: EventEmitter<any> = new EventEmitter();
  coords: Coords = { lat: 50.05, lng: 8.8 };
  user: User;
  isApiFallback = false;
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
    private loadingController: LoadingController,
    private authService: AuthService,
    private handler: HttpBackend,
    private alertController: AlertController,
    private router: Router
  ) {
    this.httpClient = new HttpClient(handler);
    this.getUser();
    this.init();
  }

  async init() {
    await this.createLoader();
    this.$mapReady.emit(true);
    this.startLocating();
  }

  getUser() {
    this.user = this.authService.getUser();
  }

  /**
   * if user has allowed locating, try gps
   * if not, user specified position. If no position specified -> prompt warning
   */
  startLocating() {
    this.getUser();
    if (this.user?.locateMe) {
      this.coords = null;
      this.watchPosition();
    } else {
      if (this.user?.coordinates) {
        this.coords = this.user?.coordinates;
        this.coordsSubject.next(this.coords);
        this.reverseGeocode(this.coords).then((res) => {
          this.location = res;
        });
      } else {
        this.presentAlertConfirm(
          'You have disabled our locating service. Please enable it or set' +
            ' your current location manually in your settings.'
        );
      }
    }
  }

  /**
   * Present alert to user, if no location is available
   * @param message the message to prompt
   */
  async presentAlertConfirm(message) {
    const alert = await this.alertController.create({
      header: 'Location not available',
      message,
      buttons: [
        {
          text: 'Ignore',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.location = 'Unknown';
            this.coords = null;
            this.coordsSubject.next(this.coords);
            this.stopTracking();
          }
        },
        {
          text: 'Settings',
          handler: async () => {
            this.location = 'Unknown';
            this.router.navigate(['pages/profile'], {
              state: { location: 'Unknown' }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Continuously tracks the current position and updates the coordsSubject with new
   * coordinates on every location change
   */
  async watchPosition() {
    await this.presentLoader();
    this.wait = Geolocation.watchPosition(
      { enableHighAccuracy: true, maximumAge: 0, timeout: 1000 },
      (position) => {
        this.ngZone.run(async () => {
          if (position && position.coords.accuracy < 100) {
            this.dismissLoader();
            this.coords = {
              lat: position?.coords.latitude,
              lng: position?.coords.longitude
            };
            this.coordsSubject.next(this.coords);
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
              this.reverseGeocode(this.coords).then((res) => {
                this.location = res;
              });
            }
          } else {
            /**
             * If geolocation failed, or if not accurate enough, try locating with IP Api fallback
             */
            if (!this.isApiFallback) {
              this.useIpApiFallback();
            }
          }
        });
      }
    );
  }

  useIpApiFallback() {
    this.httpClient
      .get<Location>(
        `http://api.ipapi.com/api/check?access_key=${environment.ipapiApi}`
      )
      .subscribe(
        (sub) => {
          this.dismissLoader();
          this.isApiFallback = true;
          this.location = sub.city;
          this.coords = { lat: sub.latitude, lng: sub.longitude };
          this.coordsSubject.next(this.coords);
        },
        () => {
          this.presentAlertConfirm(
            'We were unable to locate you. Please make sure your' +
              ' GPS is enabled and permission is granted, or set your current position' +
              ' manually in your settings.'
          );
        }
      );
  }

  async createLoader() {
    this.loadingElement = await this.loadingController.create({
      message: 'Trying to get your current location...',
      duration: 4000
    });
  }

  /**
   * Get coordinates of a place by its place_id
   * @param place place from autocomplete
   */
  async geocodePlaces(place): Promise<Coords> {
    if (!place.place_id) {
      return null;
    }
    return new Promise<Coords>((resolve) => {
      this.geocoder.geocode({ placeId: place.place_id }, (results, status) => {
        if (status !== 'OK') {
          console.log('Geocoder failed due to: ' + status);
          return null;
        } else {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          });
        }
      });
    });
  }

  /**
   * Get name of a city from coordinates
   * @param coords the coordinates
   */
  async reverseGeocode(coords): Promise<string> {
    if (!coords) {
      return;
    }
    return new Promise<string>((resolve) => {
      this.geocoder.geocode({ location: coords }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            results[0].address_components.forEach((adr) => {
              if (adr.types[0] === 'locality') {
                resolve(adr.long_name);
              }
            });
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
        }
      });
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

interface Location {
  latitude: number;
  longitude: number;
  city: string;
}
