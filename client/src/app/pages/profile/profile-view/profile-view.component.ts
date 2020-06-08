import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../../services/Auth/auth.service';
import { User } from '../../../../../interfaces/user';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  public user: User;
  constructor(
    public modalCtrl: ModalController,
    public authService: AuthService) {}

  ngOnInit() {}

  close() {
    this.modalCtrl.dismiss();
  }
}
