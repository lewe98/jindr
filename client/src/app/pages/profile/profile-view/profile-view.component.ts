import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { AssetService } from '../../../services/Asset/asset.service';
import { Interest } from '../../../../../interfaces/interest';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  user: User = new User();
  date;
  interests = [Interest];

  constructor(
    private modalCtrl: ModalController,
    public authService: AuthService,
    private navParams: NavParams,
    public assetService: AssetService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.navParams.get('user'));
    Object.assign(this.interests, this.assetService.getInterests());

    if (this.user.dateOfBirth) {
      this.date = Math.abs(Math.floor(
        (Date.now() - new Date(this.user.dateOfBirth).getTime()) / 31556952000
      ));
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
