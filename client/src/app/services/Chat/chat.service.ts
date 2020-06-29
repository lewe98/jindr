import { EventEmitter, Injectable } from '@angular/core';
import { Message } from '../../../../interfaces/message';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { MessageWrapper } from '../../../../interfaces/messageWrapper';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../Auth/auth.service';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  allChats: MessageWrapper[] = [];
  wrapperSubject: BehaviorSubject<MessageWrapper[]> = new BehaviorSubject<
    MessageWrapper[]
  >(this.allChats);
  unreadSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  unread$ = this.unreadSubject.asObservable();
  allChats$ = this.wrapperSubject.asObservable();
  public $newMessage: EventEmitter<any> = new EventEmitter();
  activeChat: string;
  constructor(
    private databaseController: DatabaseControllerService,
    private authService: AuthService
  ) {
    this.getAllWrappers();
  }

  sendMessage(message: Message, wrapper: MessageWrapper): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!wrapper._id) {
        wrapper.messages.push(message);
        this.databaseController
          .postRequest(
            'new-wrapper',
            JSON.stringify({ wrapper }),
            MessageWrapper
          )
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err.message);
          });
      } else {
        this.databaseController
          .postRequest(
            'new-message',
            JSON.stringify({ wrapperID: wrapper._id, message }),
            Message
          )
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  addMessageAndSort(message, wrapperID) {
    const idx = _.findIndex(this.allChats, { _id: wrapperID });
    this.allChats[idx].messages.push(message);
    this.sortWrapper();
    this.$newMessage.emit(true);
  }

  sortWrapper() {
    this.allChats.sort((a, b) =>
      a.messages[a.messages.length - 1].timeStamp <
      b.messages[b.messages.length - 1].timeStamp
        ? -1
        : 1
    );
    this.countUnread();
    this.wrapperSubject.next(this.allChats);
  }

  addWrapperAndSort(wrapper: MessageWrapper) {
    this.allChats.unshift(wrapper);
    this.countUnread();
    this.wrapperSubject.next(this.allChats);
  }

  getAllWrappers() {
    this.databaseController
      .getRequest(
        'message-wrapper-by-user',
        this.authService.user?._id,
        MessageWrapper
      )
      .then((res) => {
        this.allChats = res.data;
        this.allChats.sort((a, b) =>
          a.messages[a.messages.length - 1].timeStamp <
          b.messages[b.messages.length - 1].timeStamp
            ? -1
            : 1
        );
        this.countUnread();
        this.wrapperSubject.next(this.allChats);
      });
  }

  countUnread() {
    let unreadCount = 0;
    this.allChats.map((c) => {
      let lastRead;
      if (this.authService.user._id === c.employer) {
        lastRead = c.employerLastViewed;
      } else {
        lastRead = c.employeeLastViewed;
      }
      const tmp = c.messages.filter(
        (m) => m.timeStamp > lastRead && m.sender !== this.authService.user._id
      );
      c.unread = tmp.length;
      unreadCount += tmp.length;
    });
    this.unreadSubject.next(unreadCount);
  }
  updateWrapper(wrapper: MessageWrapper, you: string): Promise<MessageWrapper> {
    return new Promise<MessageWrapper>((resolve) => {
      this.databaseController
        .putRequest(
          'update-wrapper',
          JSON.stringify({ wrapper, you }),
          MessageWrapper
        )
        .then((res) => {
          resolve(res.data);
          this.putUpdatedWrapper(res.data);
        });
    });
  }

  putUpdatedWrapper(wrapper: MessageWrapper) {
    const idx = _.findIndex(this.allChats, { _id: wrapper._id });
    this.allChats[idx].employeeImage = wrapper.employeeImage;
    this.allChats[idx].employerImage = wrapper.employerImage;
    this.allChats[idx].employeeName = wrapper.employeeName;
    this.allChats[idx].employerName = wrapper.employerName;
    this.allChats[idx].employeeLastViewed = wrapper.employeeLastViewed;
    this.allChats[idx].employerLastViewed = wrapper.employerLastViewed;
    this.countUnread();
    this.wrapperSubject.next(this.allChats);
  }
}
