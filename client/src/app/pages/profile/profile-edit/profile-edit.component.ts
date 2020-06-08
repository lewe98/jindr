import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController,
  NavController
} from '@ionic/angular';
import { CurriculumComponent } from '../curriculum/curriculum.component';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  public description: string;
  public dateofbirth: number;
  public firstName: string;
  public lastName: string;

  user: User = new User();
  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
  }

  saveedit() {
    this.user.description = this.description;
    this.user.dateofbirth = this.dateofbirth;
    this.user.firstName = this.firstName;
    this.user.lastName = this.lastName;
    this.authService
      .updateUser(this.user)
      .then(() => {
        this.toastService.presentToast('Profil updated.');
      })
      .catch((err) => {
        this.toastService.presentWarningToast(err.errors.email, 'Error!');
        this.user = this.authService.getUser();
        console.log(this.authService.user);
      });
  }

  async editCurriculum() {
    const modal = await this.modalCtrl.create({
      component: CurriculumComponent,
      componentProps: {
        inputUser: this.authService.getUser(),
        myView: true
      }
    });
    return await modal.present();
  }
}
