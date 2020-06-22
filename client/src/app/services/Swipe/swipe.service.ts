import { Injectable, OnDestroy } from '@angular/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { AuthService } from '../Auth/auth.service';
import { Coords, LocationService } from '../Location/location.service';
import { Subscription } from 'rxjs';

import { Job } from '../../../../interfaces/job';

@Injectable({
  providedIn: 'root'
})
export class SwipeService implements OnDestroy {
  coords: Coords;
  coordsSub: Subscription;
  private currentPosition;
  constructor(
    private databaseController: DatabaseControllerService,
    private authService: AuthService,
    private locationService: LocationService
  ) {
    this.currentPosition = this.locationService.coords;
    this.coordsSub = this.locationService.coordsSubscription.subscribe(
      (sub) => {
        this.coords = sub;
        if (
          this.locationService.getDistanceFromLatLonInKm(
            this.currentPosition?.lat,
            this.currentPosition?.lng,
            sub?.lat,
            sub?.lng
          ) >
          (this.authService.user?.distance < 10
            ? this.authService.user?.distance / 2
            : 7)
        ) {
          this.currentPosition = { lat: sub.lat, lng: sub.lng };
          this.updateBacklog();
        }
      }
    );
  }

  getClientStack(): Promise<[]> {
    return new Promise<[]>((resolve) => {
      const data = JSON.stringify({
        user: this.authService.user,
        coords: this.locationService.coords
      });
      this.databaseController.putRequest('job-stack', data, Job).then((res) => {
        if (res.data.length < 1 || res.data.length === undefined) {
          resolve([]);
        } else {
          resolve(res.data);
        }
      });
    });
  }

  updateBacklog() {
    const data = JSON.stringify({
      user: this.authService.user,
      coords: this.coords
    });
    this.databaseController.putRequest('update-backlog', data);
  }

  makeDecision(
    jobID: string,
    isLike: boolean,
    stackLength: number
  ): Promise<Job> {
    return new Promise<Job>((resolve) => {
      const data = JSON.stringify({
        jobID,
        isLike,
        user: this.authService.user,
        coords: this.coords,
        stackLength
      });
      this.databaseController.putRequest('decision', data, Job).then((res) => {
        resolve(res.data);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.coordsSub) {
      this.coordsSub.unsubscribe();
    }
  }
}
