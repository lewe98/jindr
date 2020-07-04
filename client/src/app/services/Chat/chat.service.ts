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

  /**
   * Sends a new message or creates a new message wrapper if message wrapper does not exist
   * @param message the message to add to the wrapper
   * @param wrapper the message wrapper to add the message to. ID is empty if message wrapper does
   * not exist
   */
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

  /**
   * Adds a new message to an existing wrapper
   * @param message the message to add to the wrapper
   * @param wrapperID the id of the wrapper
   */
  addMessageAndSort(message, wrapperID) {
    const idx = _.findIndex(this.allChats, { _id: wrapperID });
    this.allChats[idx].messages.push(message);
    this.sortWrapper();
    this.$newMessage.emit(true);
  }

  /**
   * Sorts all messageWrappers by timestamp of the last message, in descending order
   */
  sortWrapper() {
    this.allChats.sort((a, b) =>
      a.messages[a.messages.length - 1].timeStamp >
      b.messages[b.messages.length - 1].timeStamp
        ? -1
        : 1
    );
    this.countUnread();
    this.wrapperSubject.next(this.allChats);
  }

  /**
   * pushes a new wrapper to the front of the list, since a new wrapper will always
   * contain the latest message
   * @param wrapper the wrapper to add to the list
   */
  addWrapperAndSort(wrapper: MessageWrapper) {
    this.allChats.unshift(wrapper);
    this.countUnread();
    this.wrapperSubject.next(this.allChats);
  }

  /**
   * Gets all wrappers of the user from the server
   */
  getAllWrappers() {
    this.databaseController
      .getRequest(
        'message-wrapper-by-user',
        this.authService.user?._id,
        MessageWrapper
      )
      .then((res) => {
        if (res.data.length > 0) {
          this.allChats = res.data;
          this.sortWrapper();
        } else {
          this.allChats = [];
        }
      });
  }

  /**
   * Counts how many unread messages a user has per messageWrapper
   * Every message received after last time he viewed the job is unread.
   */
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

  /**
   * Updates a wrapper with current user details
   * @param wrapper the wrapper with updated information
   * @param you current users userID to check requesting user
   */
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

  /**
   * Updates information of a wrapper in the wrapperList
   * @param wrapper the wrapper with updated information
   */
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

  checkWrapperExists(userID, jobID): Promise<MessageWrapper> {
    return new Promise<MessageWrapper>((resolve) => {
      this.databaseController
        .postRequest(
          'check-wrapper-exists',
          JSON.stringify({ userID, jobID }),
          MessageWrapper
        )
        .then((res) => {
          resolve(res.data);
        });
    });
  }
}
