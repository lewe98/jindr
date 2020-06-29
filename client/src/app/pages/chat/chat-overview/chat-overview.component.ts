import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChatViewComponent } from '../chat-view/chat-view.component';
import { ChatService } from '../../../services/Chat/chat.service';
import { MessageWrapper } from '../../../../../interfaces/messageWrapper';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/Auth/auth.service';

@Component({
  selector: 'app-chat-overview',
  templateUrl: './chat-overview.component.html',
  styleUrls: ['./chat-overview.component.scss']
})
export class ChatOverviewComponent implements OnInit, OnDestroy {
  messageWrappers: MessageWrapper[] = [];
  filterWrappers: MessageWrapper[] = [];
  subscriptions: Subscription[] = [];
  you;
  searchQuery = '';
  constructor(
    private modalCtrl: ModalController,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.you = this.authService.user?._id;
    this.subscriptions.push(
      this.chatService.allChats$.subscribe((chats) => {
        this.messageWrappers = chats;
        this.filterWrappers = chats;
      })
    );
  }

  async goToChat(chat) {
    const modal = await this.modalCtrl.create({
      component: ChatViewComponent,
      componentProps: { wrapper: chat }
    });
    return await modal.present();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
  }

  search() {
    this.filterWrappers = this.messageWrappers.filter(
      (w) =>
        (w.employee !== this.you &&
          w.employeeName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())) ||
        (w.employer !== this.you &&
          w.employerName.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }
}
