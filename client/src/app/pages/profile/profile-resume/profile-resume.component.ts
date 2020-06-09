import { Component, Input, OnInit } from '@angular/core';
import { DatabaseControllerService } from '../../../services/DatabaseController/database-controller.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { AuthService } from '../../../services/Auth/auth.service';
import { User } from '../../../../../interfaces/user';
import { ResumeEntry } from '../../../../../interfaces/ResumeEntry';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss']
})
export class ProfileResumeComponent implements OnInit {
  @Input() inputUser: User;
  resumeEntry: ResumeEntry;
  isEdit: boolean;
  index: number;

  constructor(
    private databaseController: DatabaseControllerService,
    private toastService: ToastService,
    public authService: AuthService,
    public modalCtrl: ModalController,
    private navParams: NavParams
  ) {}

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    this.index = this.navParams.get('resumeIndex');
    this.isEdit = this.navParams.get('isEdit');
    if (this.isEdit) {
      console.log('hallo');
      this.resumeEntry = this.inputUser.resume[this.index];
      this.isEdit = true;
    } else {
      this.resumeEntry = new ResumeEntry();
      this.isEdit = false;
    }
    console.log(this.resumeEntry);
  }

  save() {
    if (
      this.resumeEntry.company &&
      this.resumeEntry.description &&
      this.resumeEntry.startDate &&
      this.resumeEntry.endDate
    ) {
      if (this.isEdit) {
        this.inputUser.resume[this.index] = this.resumeEntry;
      } else {
        this.inputUser.resume.push(this.resumeEntry);
      }
      this.authService
        .updateUser(this.inputUser)
        .then(() => {
          this.close();
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.message, 'Error');
        });
    } else {
      this.toastService.presentWarningToast(
        'Please enter all required information!',
        'Error!'
      );
    }
  }

  selectStart(event) {
    this.resumeEntry.startDate = new Date(event.detail.value).getTime();
  }

  selectEnd(event) {
    this.resumeEntry.endDate = new Date(event.detail.value).getTime();
  }
}
