import { Component, Input, OnInit } from "@angular/core";
import { DatabaseControllerService } from "../../../services/DatabaseController/database-controller.service";
import { ToastService } from "../../../services/Toast/toast.service";
import { AuthService } from "../../../services/Auth/auth.service";
import { User } from "../../../../../interfaces/user";
import { ResumeEntry } from "../../../../../interfaces/ResumeEntry";
import { ModalController } from "@ionic/angular";

@Component({
  selector: 'app-profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss'],
})
export class ProfileResumeComponent implements OnInit {
  @Input() inputUser: User
  private myReview = this.inputUser._id == this.authService.user._id;
  private user: User;
  private startDate: Date;
  private endDate: Date;
  private title= "Lewe";
  private description: string;
  private industrysector: string;
  private employmentType: string;
  constructor(
    private databaseController: DatabaseControllerService,
    private toastService: ToastService,
    private authService: AuthService,
    public modalCtrl: ModalController
  ) {}

  close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    Object.assign(this.user, this.authService.getUser());
  }

  addResumeEntry(){
    const resumeEntry = new ResumeEntry(
      this.startDate, this.endDate,this.title, this.description, this.industrysector, this.employmentType
    )
    this.user.resume.push(resumeEntry)
    this.user.resume.sort((a: ResumeEntry, b: ResumeEntry) => {
        return +new Date(a.startDate) - +new Date(b.startDate);
      });
    if(this.inputUser._id == this.authService.user._id){}
  }

  updateResume() {
    this.authService.updateUser(this.user).then(() => {
      Object.assign(this.user, this.authService.getUser());
      }
    ).catch((err) => {
      this.toastService.presentWarningToast(err.message, 'Resume Error');
    });
  }
}
