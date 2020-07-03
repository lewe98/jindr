import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { IonTextarea } from '@ionic/angular';

@Component({
  selector: 'app-input-with-giphy',
  templateUrl: './input-with-giphy.html',
  styleUrls: ['./input-with-giphy.scss']
})
export class InputWithGiphyComponent {
  typingMessage = '';
  showGiphy = false;
  @Output() doSubmit = new EventEmitter();
  @Output() doSizeChange = new EventEmitter();
  @ViewChild('messageInput', { static: false }) messageInput: IonTextarea;

  constructor() {}

  toggleGiphy() {
    this.showGiphy = !this.showGiphy;
    this.doSizeChange.emit(this.showGiphy);
  }

  sendText(text) {
    this.doSubmit.emit({
      type: 'text',
      message: text
    });
    this.typingMessage = '';
    this.messageInput.setFocus();
  }

  sendGif(imageUrl) {
    this.doSubmit.emit({
      type: 'image',
      imageUrl
    });
    this.typingMessage = '';
  }

  onInputSizeChange() {
    this.doSizeChange.emit(this.showGiphy);
  }
}
