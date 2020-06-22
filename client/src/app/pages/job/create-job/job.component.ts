import { Component, NgZone, OnInit } from '@angular/core';
import { JobService } from '../../../services/Job/job.service';
import {
  ModalController,
  NavController,
  AlertController
} from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { Job } from '../../../../../interfaces/job';
import {
  LocationService,
  Coords
} from '../../../services/Location/location.service';
import { ImageService } from '../../../services/Image/image.service';
import { AssetService } from '../../../services/Asset/asset.service';
import { Interest } from '../../../../../interfaces/interest';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {
  createForm: FormGroup;
  job: Job = new Job();
  date: Date;

  GoogleAutocomplete: google.maps.places.AutocompleteService;
  autocomplete: { input: string };
  autocompleteItems: any[];
  coords: Coords;
  image = './assets/images/job.png';
  tempInterests: Interest[] = [];
  interests = [];
  jobInterests = [];
  cityName: string;

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private router: Router,
    private jobService: JobService,
    private locationService: LocationService,
    private ngZone: NgZone,
    private imageService: ImageService,
    private assetService: AssetService
  ) {}

  ngOnInit() {
    Object.assign(this.job); // TODO @Julian, hier muss dann dein job ausgelesen werden bei edit
    this.tempInterests = this.assetService.getInterests();
    this.interests = this.tempInterests?.map((i) => {
      return i.title;
    });
    this.jobInterests = this.job.interests?.map((i) => {
      return i.title;
    });
    this.createForm = new FormGroup({
      title: new FormControl(this.job.title, Validators.required),
      description: new FormControl(this.job.description, Validators.required),
      searchbar: new FormControl(''),
      payment: new FormControl(this.job.payment, Validators.required),
      homepage: new FormControl(this.job.homepage),
      time: new FormControl(this.job.time),
      interests: new FormControl(this.jobInterests),
      location: new FormControl(this.job.location),
      selectedOption: new FormControl('total')
    });
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  selectDOB(event) {
    this.date = event.detail.value;
  }

  updateSearchResults() {
    this.autocomplete.input = this.createForm.controls.searchbar.value;
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

  async editPicture() {
    this.imageService
      .getImage('jobPicture')
      .then(async (image) => {
        this.image = image;
      })
      .catch((error) => {
        this.toastService.presentWarningToast(error, 'Error!');
      });
  }

  async selectSearchResult(item) {
    this.createForm.controls.searchbar.setValue(item.description);
    this.autocompleteItems = [];
    this.locationService.geocodePlaces(item).then((res) => {
      this.coords = res;
      this.locationService.reverseGeocode(this.coords).then((city) => {
        this.cityName = city;
      });
    });
  }

  scrollToTop(id: string) {
    const element = document.getElementById(id);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }

  createJob() {
    this.job.title = this.createForm.controls.title.value;
    this.job.description = this.createForm.controls.description.value;
    this.job.date = this.date;
    this.job.time = this.createForm.controls.time.value;
    this.job.payment = this.createForm.controls.payment.value;
    this.job.homepage = this.createForm.controls.homepage.value;
    this.job.location = this.coords;
    this.job.isHourly =
      this.createForm.controls.selectedOption.value !== 'total';
    this.job.image = this.image;
    this.job.interests = [];
    this.job.cityName = this.cityName;
    this.job.creator = this.authService.user._id;
    if (this.createForm.controls.interests.value) {
      this.createForm.controls.interests.value.forEach((int) => {
        this.job.interests.push(
          this.tempInterests.find((i) => int === i.title)
        );
      });
    }
    this.jobService
      .createJob(this.job)
      .then(() => {
        this.toastService.presentToast('Job created.');
        this.router.navigate(['pages']);
      })
      .catch((err) => {
        this.toastService.presentWarningToast(err.message, 'Error!');
      });
  }
}
