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

  /**
   * Establishes socket connection with server
   * @param userID id of the current user to save in the server map
   */
  connect(userID) {
    this.userID = userID;
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  /**
   * Sends a socket request to the server
   * @param identifier name of the socket request
   * @param data to send to the server
   */
  send(identifier: string, data) {
    this.socket.emit(identifier, data);
  }

  /**
   * Method to initialize and listen to incoming server responses
   */
  initResponses() {
    /**
     * Send user ID to the server after connection was established
     */
    this.socket.on('connect', () => {
      this.socket.emit('init', this.userID);
    });
    /**
     * Listens for new message wrappers
     */
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

    /**
     * Listens for new messages
     */
    this.socket.on('new-message', (data) => {
      this.chatService.addMessageAndSort(data.message, data.wrapperID);
      if (this.chatService.activeChat !== data.wrapperID) {
        this.toastService.presentNotification(
          'New Message',
          'You got a new message.',
          'pages/chat',
          data.wrapperID
        );
      }
    });

    /**
     * Listens for updated wrappers
     */
    this.socket.on('update-wrapper', (data) => {
      this.chatService.putUpdatedWrapper(data.wrapper);
    });
  }
}
