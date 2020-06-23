import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import MESSAGES from './messages.dummy';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  messages: any[];

  constructor() {}

  ngOnInit() {
    this.messages = MESSAGES;
    this.scrollToBottom(null, true);
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

  onSubmitMessage(data: any) {
    setTimeout(() => {
      this.scrollToBottom();
    });
  }
}
