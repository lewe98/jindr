import { Injectable } from '@angular/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  interests;
  constructor(private databaseController: DatabaseControllerService) {}

  async getInterestsRoute(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.databaseController
        .getRequest('interests', '')
        .then((res) => {
          this.interests = res.data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getInterests() {
    return this.interests;
  }
}
