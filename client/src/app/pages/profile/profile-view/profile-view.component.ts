import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { LocationService } from '../../../services/Location/location.service';


@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  user: User = new User();
  constructor(
      private navCtrl: NavController,
      private modalCtrl: ModalController,
      private authService: AuthService,
      private toastService: ToastService,
      private locationService: LocationService,
      private navParams: NavParams
  ) {}

  async ngOnInit() {
    Object.assign(this.user, this.navParams.get('user'));
  }


  close() {
    this.modalCtrl.dismiss();
  }
}
