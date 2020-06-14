import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { User } from '../../../../../interfaces/user';
import { ProfileResumeComponent } from '../profile-resume/profile-resume.component';
import { ResumeEntry } from '../../../../../interfaces/ResumeEntry';
import { AuthService } from '../../../services/Auth/auth.service';
import { ToastService } from '../../../services/Toast/toast.service';

@Component({
  selector: 'app-curriculum',
  templateUrl: './curriculum.component.html',
  styleUrls: ['./curriculum.component.scss']
})
export class CurriculumComponent implements OnInit {
  @Input() myView: boolean;
  @Input() inputUser?: User;
  user: User = new User();
  private allowChange: boolean;

  constructor(
    public modalCtrl: ModalController,
    public alertController: AlertController,
    public authService: AuthService,
    public toastService: ToastService
  ) {}

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    if (this.inputUser._id === this.user?._id) {
      this.allowChange = true;
      Object.assign(this.inputUser, this.authService.getUser());
    }
  }

  getResumeEntryTime(startDate: Date, endDate: Date): string {
    const timeTmp = new Date(endDate).getTime() - new Date(startDate).getTime();
    const timeNumber = timeTmp / 2678400000;
    if (timeNumber.toFixed() === '1') {
      return timeNumber.toFixed() + ' Month';
    } else if (timeNumber / 12 >= 1) {
      return (
        (timeNumber / 12).toFixed() +
        ' Years, ' +
        (12 - (timeNumber % 12)).toFixed() +
        ' Months'
      );
    }
    return timeNumber.toFixed() + ' Months';
  }

  async newResume() {
    const modal = await this.modalCtrl.create({
      component: ProfileResumeComponent,
      componentProps: {
        inputUser: this.inputUser,
        resumeIndex: -1
      }
    });
    return await modal.present();
  }

  // async editResume(resumeEntry: ResumeEntry)
  async editResume(resumeEntry: ResumeEntry) {
    if (this.allowChange) {
      const resumeIndex = this.user.resume.indexOf(resumeEntry);
      const modal = await this.modalCtrl.create({
        component: ProfileResumeComponent,
        componentProps: {
          inputUser: this.user,
          resumeIndex
        }
      });
      Object.assign(this.inputUser, this.authService.getUser());
      return await modal.present();
    } else {
      this.toastService.presentWarningToast(
        'You are not allowed to change other resume entry.',
        'Authorisation error!'
      );
    }
  }

  async deleteResume(resumIndex: number) {
    if (this.allowChange) {
      const alert = await this.alertController.create({
        cssClass: '',
        header: 'Delete Resume entry!',
        message: 'Are you sure you want to <strong>delete</strong> the entry?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Okay',
            handler: () => {
              this.user.resume.splice(resumIndex, 1);
              this.authService
                .updateUser(this.user)
                .then(() => {
                  Object.assign(this.inputUser, this.authService.getUser());
                  this.toastService.presentWarningToast(
                    'Your resume entry has bin deleted.',
                    'success!'
                  );
                })
                .catch((err) => {
                  this.toastService.presentWarningToast(
                    err.message,
                    'Could not delete review entry!'
                  );
                });
            }
          }
        ]
      });
      await alert.present();
    } else {
      await this.toastService.presentWarningToast(
        'You only can delete your own resume entry.',
        'Can not delete!'
      );
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
