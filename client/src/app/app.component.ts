import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AuthService } from './services/Auth/auth.service';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { IonRouterOutlet } from '@ionic/angular';
import { RouterService } from './services/Router/router.service';
const { SplashScreen } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild(IonRouterOutlet, { static: false }) routerOutlet: IonRouterOutlet;
  constructor(
    private authService: AuthService,
    private router: Router,
    private routerService: RouterService
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      await SplashScreen.hide();
    } catch (err) {
      console.log('This is normal in a browser', err);
    }
    if (await this.authService.checkLogin()) {
      this.router.navigate(['pages']);
    }
  }

  ngAfterViewInit(): void {
    this.routerService.init(this.routerOutlet);
  }
}
