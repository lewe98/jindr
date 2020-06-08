import { Component, Input, OnInit } from '@angular/core';
import { DatabaseControllerService } from '../../../services/DatabaseController/database-controller.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { AuthService } from '../../../services/Auth/auth.service';
import { User } from '../../../../../interfaces/user';
import { ResumeEntry } from '../../../../../interfaces/ResumeEntry';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss']
})
export class ProfileResumeComponent implements OnInit {
  @Input() inputUser: User;
  @Input() resumeIndex: number;
  private myReview = false;

  private user = new User();
  private resumeEntry: ResumeEntry;
  private startDate: Date;
  private endDate: Date;
  private title: string;
  private description: string;
  private industrysector: string;
  private employmentType: string;

  constructor(
    private databaseController: DatabaseControllerService,
    private toastService: ToastService,
    private authService: AuthService,
    public modalCtrl: ModalController
  ) {
  }

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
    this.myReview = this.inputUser?._id === this.authService.user?._id;
    if (this.resumeIndex >= 0) {
      const tmpResumeEntry = this.inputUser.resume[this.resumeIndex];
      this.startDate = tmpResumeEntry.startDate;
      this.endDate = tmpResumeEntry.endDate;
      this.title = tmpResumeEntry.title;
      this.description = tmpResumeEntry.description;
      this.industrysector = tmpResumeEntry.industrysector;
      this.employmentType = tmpResumeEntry.employmentType;
    }
  }

  addResumeEntry() {
    if (this.myReview) {
      if (this.title !== '' && this.description !== '' && this.industrysector !== '' && this.employmentType !== '') {
        if (new Date(this.startDate).getTime() < new Date(this.endDate).getTime()) {
        this.resumeEntry = new ResumeEntry(
          new Date(this.startDate), new Date(this.endDate), this.title, this.description, this.industrysector, this.employmentType
        );
        if (this.resumeIndex >= 0) {
          this.user.resume[this.resumeIndex] = this.resumeEntry;
        } else {
          this.user.resume.push(this.resumeEntry);
        }

        this.user.resume.sort((a: ResumeEntry, b: ResumeEntry) => {
          return new Date(a.startDate).valueOf() - new Date(b.startDate).valueOf();
        });
        this.updateUser();
      } else {
          this.toastService.presentWarningToast('The start date must be before the end date.', 'Wrong date!');
        }
      } else {
        this.toastService.presentWarningToast('You must fill out every line.', 'Empty field!');
      }
    } else {
      this.toastService.presentWarningToast('You are not allowed do chance th resume.', 'Authorisation error!');
    }
  }

  updateUser() {
    this.authService.updateUser(this.user).then(() => {
        Object.assign(this.user, this.authService.getUser());
      }
    ).catch((err) => {
      this.toastService.presentWarningToast(err.message, 'Resume Error');
    });
    this.modalCtrl.dismiss();
  }
}
