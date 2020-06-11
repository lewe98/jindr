import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LocationService } from '../../services/Location/location.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/Auth/auth.service';
import { User } from '../../../../interfaces/user';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map;
  mapOptions: google.maps.MapOptions = {
    zoom: 13,
    scrollwheel: false,
    mapTypeControl: false,
    scaleControl: false,
    draggable: false,
    center: { lat: 50.94843174, lng: 10.315375 },
    disableDefaultUI: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  user: User = new User();
  subscription: Subscription[] = [];
  constructor(
    private locationService: LocationService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.subscription.push(
      this.authService.user$.subscribe((user) => {
        this.user = user;
      })
    );
  }

  async ngAfterViewInit() {
    this.map = new google.maps.Map(
      this.mapElement.nativeElement,
      this.mapOptions
    );
    this.initPosition();
    this.locationService.$mapReady.subscribe((isReady) => {
      if (isReady) {
        this.locationService.getCurrentPosition();
      }
    });
  }

  initPosition() {
    this.subscription.push(
      this.locationService.coordsSubscription.subscribe((sub) => {
        if (sub.lat && sub.lng) {
          this.map.setZoom(13);
          const currentLocation = new google.maps.LatLng(sub.lat, sub.lng);
          this.map.setCenter(currentLocation);
        } else {
          this.map.setZoom(8);
        }
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
}
