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
  circle: google.maps.Circle;
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
    this.subscription.push(
      this.locationService.$radiusChanged.subscribe((isReady) => {
        if (isReady) {
          this.updateRadius();
        }
      })
    );
  }

  updateRadius() {
    // still buggy, zooms out the map completely
    // this.locationService.coordsSubject.next(this.locationService.coords);
  }

  initPosition() {
    this.subscription.push(
      this.locationService.coordsSubscription.subscribe((sub) => {
        if (sub.lat && sub.lng) {
          if (this.circle) {
            this.circle.setMap(null);
          }
          this.map.setZoom(13);
          const currentLocation = new google.maps.LatLng(sub.lat, sub.lng);
          this.map.setCenter(currentLocation);
          const circleOptions = {
            center: currentLocation,
            fillOpacity: 0.04,
            strokeOpacity: 0.5,
            color: '#dafffa',
            strokeColor: '#dafffa',
            map: this.map,
            radius: (this.authService.user.distance * 1000) / 2
          };
          this.circle = new google.maps.Circle(circleOptions);
          this.map.fitBounds(this.circle.getBounds());
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
