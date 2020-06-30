import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatOverviewComponent } from './chat-overview/chat-overview.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShellModule } from '../../shell/shell.module';
import {
  ChatViewComponent,
  PopoverComponent
} from './chat-view/chat-view.component';
import { GiphyModule } from './giphy/giphy';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: ChatOverviewComponent
  }
];

@NgModule({
  declarations: [ChatOverviewComponent, ChatViewComponent, PopoverComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ShellModule,
    GiphyModule,
    FormsModule
  ]
})
export class ChatModule {}
