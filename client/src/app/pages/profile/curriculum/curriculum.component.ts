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
  @Input() inputUser = new User();
  user: User = new User();
  private allowChange: boolean;

  constructor(
    public modalCtrl: ModalController,
    public alertController: AlertController,
    public authService: AuthService,
    public toastService: ToastService
  ) {
  }

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    if (this.inputUser?._id === this.user?._id) {
      this.allowChange = true;
      Object.assign(this.inputUser, this.authService.getUser());
    }
  }

  /***
   * The Method calculates the Months and Years between two dates.
   * @param startDate is the startDate
   * @param endDate is the end of the time Period
   * @return String example: '1 Month, 5 Years'
   */
  getResumeEntryTime(startDate: Date, endDate: Date): string {
    const date = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 2592000000;
    const year = Math.floor(date / 12);
    let yearString = ' Years';
    const month = Math.floor(date % 12);
    let monthString = ' Months';
    if (year === 1) {
      yearString = ' Year';
    }
    if (month === 1) {
      monthString = ' Month';
    }
    if (year === 0) {
      return month + monthString;
    }
    if (month === 0) {
      return year + yearString;
    }
    return month + monthString + ', ' + year + yearString;
  }

  /***
   * Method that opens a  Modal to edit a ResumeEntry
   * @param resumeEntry is the Entry that will be edited
   * error if the ResumeEntry is not the Entry of the user
   *        the Modal  will not open and show a reject message
   * success the  Modal will open with the selected Entry
   */
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

  /***
   * This Method deletes a ResumeEntry
   * @param resumIndex of the Entry that will be deleted
   * The method checks if the User is allowed to delete the ResumeEntry
   * if the user is allowed it opens a alert to double check
   * if the User clicks 'Okay' the Entry will be deleted in the user updateUser()
   * will be called
   * error the user gets a error message
   * success the Entry is deleted and the user is updated
   */
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
