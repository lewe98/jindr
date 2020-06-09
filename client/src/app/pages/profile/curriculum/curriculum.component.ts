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
  @Input() inputUser: User;
  private user: User = new User();

  constructor(public modalCtrl: ModalController,
              public alertController: AlertController,
              public authService: AuthService,
              public toastService: ToastService) {
  }

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
  }

  getResumeEntryDate(startDate: Date, endDate: Date): string {
    return new Date(startDate).toLocaleDateString() + ' - ' + new Date(endDate).toLocaleDateString();
  }

  getResumeEntryTime(startDate: Date, endDate: Date): string {
    const timeTmp = new Date(endDate).getTime() - new Date(startDate).getTime();
    return String((timeTmp / 2678400000).toFixed()) + ' Months';
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
    const resumeIndex = this.inputUser.resume.indexOf(resumeEntry);
    const modal = await this.modalCtrl.create({
      component: ProfileResumeComponent,
      componentProps: {
        inputUser: this.inputUser,
        resumeIndex
      }

    });
    return await modal.present();
  }

  async deleteResume(resumIndex: number) {
    if (this.user._id === this.inputUser._id) {
      const alert = await this.alertController.create({
        cssClass: '',
        header: 'Delete Resume entry!',
        message: 'Are you sure you want to <strong>delete</strong> the entry?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
            }
          }, {
            text: 'Okay',
            handler: () => {
              this.user.resume.splice(resumIndex, 1);
              this.authService.updateUser(this.user).then(() => {
                  Object.assign(this.inputUser, this.authService.getUser());
                  this.toastService.presentWarningToast('Your resume entry has bin deleted.', 'success!');
                }
              ).catch((err) => {
                this.toastService.presentWarningToast(err.message, 'Could not delete review entry!');
              });
            }
          }
        ]
      });
      await alert.present();
    } else {
      await this.toastService.presentWarningToast('You only can delete your own resume entry.', 'Can not delete!');
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
