import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavParams } from '@ionic/angular';
import { MessageWrapper } from '../../../../../interfaces/messageWrapper';
import { Message } from '../../../../../interfaces/message';
import { AuthService } from '../../../services/Auth/auth.service';
import { User } from '../../../../../interfaces/user';
import { Job } from '../../../../../interfaces/job';
import { ChatService } from '../../../services/Chat/chat.service';
import { JobService } from '../../../services/Job/job.service';
import { Subscription } from 'rxjs';

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
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
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
  onSubmitMessage(data: any) {
    this.message.body =
      data.type.toUpperCase() === 'IMAGE' ? data.imageUrl : data.message;
    this.message.timeStamp = Date.now();
    this.message.type = data.type;
    this.message.sender = this.you._id;
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

  close() {
    this.modalCtrl.dismiss();
    this.chatService.activeChat = null;
    if (this.you._id.toString() === this.messageWrapper.employer.toString()) {
      this.messageWrapper.employerLastViewed = Date.now();
    } else {
      this.messageWrapper.employeeLastViewed = Date.now();
    }
    this.chatService.updateWrapper(this.messageWrapper, this.you._id);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
  }
}
