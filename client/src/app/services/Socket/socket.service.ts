import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ChatService } from '../Chat/chat.service';
import { ToastService } from '../Toast/toast.service';
import { MessageWrapper } from '../../../../interfaces/messageWrapper';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  userID: string;
  constructor(
    private socket: Socket,
    private chatService: ChatService,
    private toastService: ToastService
  ) {
    this.initResponses();
  }

  connect(userID) {
    this.userID = userID;
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  send(identifier: string, data) {
    this.socket.emit(identifier, data);
  }

  initResponses() {
    this.socket.on('connect', () => {
      this.socket.emit('init', this.userID);
    });
    this.socket.on('new-wrapper', (wrapper: MessageWrapper) => {
      this.chatService.addWrapperAndSort(wrapper);
      if (this.chatService.activeChat !== wrapper._id) {
        this.toastService.presentNotification(
          'New Message',
          wrapper.employerName + ' sent you a message.',
          'pages/chat'
        );
      }
    });

    this.socket.on('new-message', (data) => {
      console.log(data);
      this.chatService.addMessageAndSort(data.message, data.wrapperID);
      if (this.chatService.activeChat !== data.wrapperID) {
        this.toastService.presentNotification(
          'New Message',
          'You got a new message.',
          'pages/chat'
        );
      }
    });

    this.socket.on('update-wrapper', (data) => {
      this.chatService.putUpdatedWrapper(data.wrapper);
    });
  }
}
