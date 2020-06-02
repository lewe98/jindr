import { Component } from '@angular/core';
import { AuthService } from './services/Auth/auth.service';
import { Router } from '@angular/router';
import {Plugins} from '@capacitor/core';
const { SplashScreen } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private router: Router
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
}
