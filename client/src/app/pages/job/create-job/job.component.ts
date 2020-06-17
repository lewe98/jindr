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
  location: any;
  placeid: any;
  coords: Coords;

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private router: Router,
    private jobService: JobService,
    private locationService: LocationService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    Object.assign(this.job);
    this.createForm = new FormGroup({
      title: new FormControl(this.job.title, Validators.required),
      description: new FormControl(this.job.description, Validators.required),
      searchbar: new FormControl(''),
      payment: new FormControl(this.job.payment),
      homepage: new FormControl(this.job.homepage),
      time: new FormControl(this.job.time),
      date: new FormControl(this.job.date),
      interests: new FormControl(this.job.interests),
      location: new FormControl(this.job.location)
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
      (predictions, status) => {
        this.autocompleteItems = [];
        this.ngZone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      }
    );
  }

  async selectSearchResult(item) {
    this.location = item;
    this.placeid = this.location.place_id;
    // TODO get coordinates from place with geocoding
    this.coords = await this.locationService.geocodePlaces(
      this.location.place_id
    );
  }

  createJob() {
    this.job.title = this.createForm.controls.title.value;
    this.job.description = this.createForm.controls.description.value;
    // this.job.date = this.createForm.controls.date.value;
    // this.job.time = this.createForm.controls.time.value;
    this.job.payment = this.createForm.controls.payment.value;
    this.job.homepage = this.createForm.controls.homepage.value;
    this.job.interests = this.createForm.controls.interests.value;
    this.job.location = this.coords;
    console.log(this.job);
    this.jobService
      .createJob(
        this.job.title,
        this.job.description,
        this.date,
        this.job.time,
        this.job.payment,
        this.job.location,
        './assets/images/avatar.jpg'
      )
      .then(() => {
        this.toastService.presentToast('Job created.');
        this.router.navigate(['pages']);
      })
      .catch((err) => {
        this.toastService.presentWarningToast(err.message, 'Error!');
      });
  }
}
