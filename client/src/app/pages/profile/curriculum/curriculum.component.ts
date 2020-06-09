import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
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
export class CurriculumComponent implements OnInit, OnChanges {
  @Input() inputUser: User;
  isEdit: boolean;
  sortedResume: ResumeEntry[];

  constructor(
    public modalCtrl: ModalController,
    public authService: AuthService,
    public toastService: ToastService,
    private alertController: AlertController
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    const tempUser = changes.inputUser.currentValue;
    this.sortResume(tempUser);
  }

  sortResume(user: User) {
    this.sortedResume = user?.resume.sort((n1, n2) => {
      if (n1.startDate < n2.startDate) {
        return 1;
      }
      if (n1.startDate > n2.startDate) {
        return -1;
      }
      return 0;
    });
  }

  ngOnInit() {
    this.isEdit = this.inputUser?._id === this.authService.user?._id;
    this.sortResume(this.inputUser);
  }

  async editResume(resumeEntry: ResumeEntry) {
    const resumeIndex = this.inputUser.resume.indexOf(resumeEntry);
    const modal = await this.modalCtrl.create({
      component: ProfileResumeComponent,
      componentProps: {
        inputUser: this.inputUser,
        resumeIndex,
        isEdit: true
      }
    });
    return await modal.present();
  }

  async deleteResume(entry: ResumeEntry) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to <strong>delete</strong> this entry?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Okay',
          handler: () => {
            this.inputUser.resume.splice(
              this.inputUser.resume.indexOf(entry),
              1
            );
            this.authService.updateUser(this.inputUser).catch((err) => {
              this.toastService.presentWarningToast(err, 'Error!');
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
