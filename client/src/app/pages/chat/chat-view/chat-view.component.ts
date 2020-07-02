import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  IonContent,
  ModalController,
  NavParams,
  PopoverController
} from '@ionic/angular';
import { MessageWrapper } from '../../../../../interfaces/messageWrapper';
import { Message } from '../../../../../interfaces/message';
import { AuthService } from '../../../services/Auth/auth.service';
import { User } from '../../../../../interfaces/user';
import { Job } from '../../../../../interfaces/job';
import { ChatService } from '../../../services/Chat/chat.service';
import { JobService } from '../../../services/Job/job.service';
import { Subscription } from 'rxjs';
import { ProfileViewComponent } from '../../profile/profile-view/profile-view.component';
import { JobDetailComponent } from '../../job/job-detail/job-detail.component';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  messageWrapper: MessageWrapper;
  message: Message = new Message();
  you: User = new User();
  he: User = new User();
  job: Job = new Job();
  subscriptions: Subscription[] = [];

  constructor(
    private navParams: NavParams,
    private authService: AuthService,
    private chatService: ChatService,
    private jobService: JobService,
    private modalCtrl: ModalController,
    public popoverController: PopoverController
  ) {}

  ngOnInit() {
    /**
     * Checks whether it is an already existing chat or to start a new one and retrieves all required data
     */
    this.you = this.authService.user;
    if (this.navParams.get('wrapper')) {
      this.messageWrapper = this.navParams.get('wrapper');
      this.chatService.activeChat = this.messageWrapper._id;
      let tmp;
      if (this.you._id === this.messageWrapper.employer) {
        tmp = this.messageWrapper.employee;
      } else {
        tmp = this.messageWrapper.employer;
      }
      this.authService.getUserByID(tmp).then((res) => {
        this.he = res;
        this.compareAndUpdate(this.messageWrapper);
      });
      this.jobService.getJobById(this.messageWrapper.jobID).then((res) => {
        this.job = res;
      });
    } else {
      this.authService.getUserByID(this.navParams.get('user')).then((res) => {
        this.he = res;
      });
      this.job = this.navParams.get('job');
      this.chatService
        .checkWrapperExists(this.navParams.get('user'), this.job?._id)
        .then((res) => {
          if (res[0]) {
            this.messageWrapper = res[0];
          }
        });
    }
    this.scrollToBottom(null, true);
    this.subscriptions.push(
      this.chatService.$newMessage.subscribe((sub) => {
        if (sub) {
          this.scrollToBottom();
        }
      })
    );
  }

  onInputSizeChange() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  scrollToBottom(duration = 500, isFirstLoad = false) {
    if (isFirstLoad) {
      setTimeout(() => {
        this.content.scrollToBottom(duration);
      }, 500);
    } else {
      this.content.scrollToBottom(duration);
    }
  }

  /**
   * Updates the values in messageWrapper that are subject to change, to improve data integrity
   * @param wrapper the wrapper to update
   */
  compareAndUpdate(wrapper: MessageWrapper) {
    if (this.you._id === wrapper.employer) {
      wrapper.employerImage = this.you.image;
      wrapper.employerName = this.you.firstName + ' ' + this.you.lastName;
      wrapper.employeeName = this.he.firstName + ' ' + this.he.lastName;
      wrapper.employeeImage = this.he.image;
    } else {
      wrapper.employeeImage = this.you.image;
      wrapper.employeeName = this.you.firstName + ' ' + this.you.lastName;
      wrapper.employerImage = this.he.image;
      wrapper.employerName = this.he.firstName + ' ' + this.he.lastName;
    }
    this.chatService.updateWrapper(wrapper, this.you._id).then((res) => {
      this.messageWrapper.employerName = res.employerName;
      this.messageWrapper.employeeName = res.employeeName;
      this.messageWrapper.employeeImage = res.employeeImage;
      this.messageWrapper.employerImage = res.employerImage;
    });
  }

  /**
   * Method to either send a message to an existing wrapper or create a new wrapper to start a chat
   * @param data attribute which contains the message body and the message type
   */
  onSubmitMessage(data: any) {
    this.message.body =
      data.type.toUpperCase() === 'IMAGE' ? data.imageUrl : data.message;
    this.message.timeStamp = Date.now();
    this.message.type = data.type;
    this.message.sender = this.you._id;
    /**
     * Create a new wrapper, fill it with required data and send it to the server
     */
    if (!this.messageWrapper) {
      this.messageWrapper = new MessageWrapper();
      this.messageWrapper.messages = [];
      this.messageWrapper.employer = this.you._id;
      this.messageWrapper.employerName =
        this.you.firstName + ' ' + this.you.lastName;
      this.messageWrapper.employeeName =
        this.he.firstName + ' ' + this.he.lastName;
      this.messageWrapper.employee = this.he._id;
      this.messageWrapper.jobID = this.job._id;
      this.messageWrapper.employeeImage = this.he.image;
      this.messageWrapper.employerImage = this.you.image;
      this.chatService
        .sendMessage(this.message, this.messageWrapper)
        .then((res) => {
          this.messageWrapper = res;
          this.chatService.addWrapperAndSort(res);
          this.chatService.activeChat = this.messageWrapper._id;
          this.scrollToBottom();
        });
    } else {
      /**
       * Send a message to an existing wrapper
       */
      this.chatService
        .sendMessage(this.message, this.messageWrapper)
        .then((res) => {
          res.isSent = true;
          this.messageWrapper.messages.push(res);
          this.chatService.sortWrapper();
          this.scrollToBottom();
        });
    }
  }

  /**
   * Closes the modal and updates the chat wrapper with current time as last viewed. This is needed
   * to check whether the user has unread messages
   */
  close() {
    this.modalCtrl.dismiss();
    this.chatService.activeChat = null;
    if (this.messageWrapper) {
      if (this.you._id.toString() === this.messageWrapper.employer.toString()) {
        this.messageWrapper.employerLastViewed = Date.now();
      } else {
        this.messageWrapper.employeeLastViewed = Date.now();
      }
      this.chatService.updateWrapper(this.messageWrapper, this.you._id);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
  }

  /**
   * Opens job details
   */
  async handleJobInfo(job) {
    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: { job }
    });
    return await modal.present();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      cssClass: 'my-custom-class',
      event: ev,
      showBackdrop: true,
      componentProps: { job: this.job, profile: this.he }
    });
    return await popover.present();
  }
}

@Component({
  template: `
    <ion-list>
      <ion-item (click)="handleJobInfo()">View Job</ion-item>
      <ion-item (click)="handleProfileInfo()">View Profile</ion-item>
    </ion-list>
  `
})
export class PopoverComponent {
  job;
  profile;
  constructor(public modalCtrl: ModalController, public navParams: NavParams) {
    this.job = this.navParams.get('job');
    this.profile = this.navParams.get('profile');
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async handleJobInfo() {
    const modal = await this.modalCtrl.create({
      component: JobDetailComponent,
      componentProps: { job: this.job }
    });
    this.close();
    return await modal.present();
  }

  async handleProfileInfo() {
    const modal = await this.modalCtrl.create({
      component: ProfileViewComponent,
      componentProps: { user: this.profile }
    });
    this.close();
    return await modal.present();
  }
}
