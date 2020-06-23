import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChatViewComponent } from '../chat-view/chat-view.component';

@Component({
  selector: 'app-chat-overview',
  templateUrl: './chat-overview.component.html',
  styleUrls: ['./chat-overview.component.scss']
})
export class ChatOverviewComponent implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  async goToChat() {
    const modal = await this.modalCtrl.create({
      component: ChatViewComponent,
      componentProps: { chat: null }
    });
    return await modal.present();
  }
}
