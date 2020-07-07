import { Component, NgZone, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { LocationService } from '../../../services/Location/location.service';
import { Router } from '@angular/router';
import { SwipeService } from '../../../services/Swipe/swipe.service';
import { ImpressumComponent } from '../impressum/impressum.component'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: User = new User();
  distance: number;
  location: string;
  allowNotifications: boolean;
  locateMeTemp: boolean;
  navBack: boolean;
  GoogleAutocomplete: google.maps.places.AutocompleteService;
  autocomplete: { input: string };
  autocompleteItems: any[];
  coordsChanged = false;
  constructor(
    public modalCtrl: ModalController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private navParams: NavParams,
    private locationService: LocationService,
    private router: Router,
    private ngZone: NgZone,
    private swipeService: SwipeService
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    this.locateMeTemp = this.user.locateMe;
    this.location = this.navParams.get('location');
    if (this.location === 'Unknown') {
      this.navBack = true;
    }
    this.distance = this.authService.getUser().distance;
    this.allowNotifications = this.authService.getUser().allowNotifications;
    if (!this.user.locateMe && this.user.coordinates) {
      this.locationService.reverseGeocode(this.user.coordinates).then((res) => {
        this.location = res;
        this.autocomplete.input = this.location;
      });
    }
  }

  close() {
    if (
      this.user.distance !== this.distance ||
      this.user.allowNotifications !== this.allowNotifications ||
      this.user.locateMe !== this.locateMeTemp ||
      this.coordsChanged
    ) {
      if (this.user.locateMe === true) {
        this.user.coordinates = null;
      }
      this.authService
        .updateUser(this.user)
        .then(() => {
          if (this.user.locateMe !== this.locateMeTemp || this.coordsChanged) {
            this.swipeService.updateBacklog();
            this.locationService.startLocating();
          }
          if (this.user.distance !== this.distance) {
            this.swipeService.updateBacklog();
            this.locationService.radiusChanged();
          }
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.message, 'Error');
        });
    }
    if (this.navBack) {
      this.router.navigate(['pages']).then(() => {
        this.modalCtrl.dismiss(this.location);
      });
    } else {
      this.modalCtrl.dismiss(this.location);
    }
  }

  allowChange() {
    if (this.user.locateMe === false) {
      this.autocompleteItems = [];
      this.autocomplete.input = '';
    }
  }

  scrollToTop(id: string) {
    const element = document.getElementById(id);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }

  async selectSearchResult(item) {
    this.autocomplete.input = item.description;
    this.autocompleteItems = [];
    this.locationService.geocodePlaces(item).then((res) => {
      this.user.coordinates = res;
      this.coordsChanged = true;
      this.locationService
        .reverseGeocode(this.user.coordinates)
        .then((city) => {
          this.location = city;
        });
    });
  }

  updateSearchResults() {
    if (this.autocomplete.input === '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      { input: this.autocomplete.input },
      (predictions) => {
        this.autocompleteItems = [];
        this.ngZone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      }
    );
  }

  logout() {
    this.authService.logOut().then(() => {
      this.close();
    });
  }

  async presentEmailPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Change Email',
      inputs: [
        {
          name: 'email',
          placeholder: 'Email...',
          value: this.user.email,
          type: 'email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.user.email = data.email;
            this.authService
              .updateUser(this.user)
              .then(() => {
                this.toastService.presentToast('Email changed.');
              })
              .catch((err) => {
                this.toastService.presentWarningToast(
                  err.errors.email,
                  'Error!'
                );
                this.user = this.authService.getUser();
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentPasswordPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password...',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.password.length >= 6) {
              this.authService
                .updateUser(this.user, data.password)
                .then(() => {
                  this.toastService.presentToast('Password changed.');
                })
                .catch((err) => {
                  this.toastService.presentWarningToast(
                    err.errors.password,
                    'Error!'
                  );
                });
            } else {
              this.toastService.presentWarningToast(
                'Password needs to contain at least 6 characters!',
                'Error!'
              );
            }
          }
        }
      ]
    });
    await alert.present();
  }

  handleScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    // Slide down to go back
    if (scrollTop < 0 && Math.abs(scrollTop) >= 150) {
      this.close();
    }
  }


  /**
   * Method to display Impressum
   */
  async showImpressModal() {
    const modal = await this.modalCtrl.create({
      component: ImpressumComponent
    });
    return await modal.present();
  }
}
