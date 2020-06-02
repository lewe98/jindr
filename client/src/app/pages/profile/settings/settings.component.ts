import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: User;
  constructor(
    public modalCtrl: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  logout() {}
}
