import { Injectable } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class RouterService {
  private routerOutlet: IonRouterOutlet;
  constructor() {}

  init(routerOutlet: IonRouterOutlet) {
    this.routerOutlet = routerOutlet;
  }

  toggleSwipeBack(isEnabled: boolean) {
    if (this.routerOutlet) {
      this.routerOutlet.swipeGesture = isEnabled;
    } else {
      throw new Error('Call init() first!');
    }
  }
}
