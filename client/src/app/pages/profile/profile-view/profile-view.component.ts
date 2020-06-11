import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  user: User = new User();
  date;
  constructor(
    private modalCtrl: ModalController,
    public authService: AuthService,
    private navParams: NavParams
  ) {}

  async ngOnInit() {
    Object.assign(this.user, this.navParams.get('user'));
    if (this.user.dateOfBirth) {
      this.date = Math.floor(
        (Date.now() - this.user.dateOfBirth) / 31556952000
      );
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
