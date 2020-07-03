import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreComponent } from './explore/explore.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RippleLoaderComponent } from './ripple-loader/ripple-loader.component';
import { SharedModule } from '../../shared/shared.module';
import { SwingModule } from 'angular2-swing';
import { SwipeCardComponent } from './swipe-card/swipe-card.component';
import { ShellModule } from '../../shell/shell.module';
import { CHAT_VIEW_TOKEN } from '../chat/chat-view/chat-view-token';
import { ChatViewComponent } from '../chat/chat-view/chat-view.component';
import { JOB_DETAIL_TOKEN } from '../job/job-detail/job-detail-token';
import { JobDetailComponent } from '../job/job-detail/job-detail.component';

const swipeRoutes: Routes = [
  {
    path: '',
    component: ExploreComponent
  }
];

@NgModule({
  declarations: [ExploreComponent, RippleLoaderComponent, SwipeCardComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(swipeRoutes),
    SharedModule,
    SwingModule,
    ShellModule
  ],
  exports: [RippleLoaderComponent, SwipeCardComponent],
  providers: [
    { provide: CHAT_VIEW_TOKEN, useValue: ChatViewComponent },
    { provide: JOB_DETAIL_TOKEN, useValue: JobDetailComponent }
  ]
})
export class SwipeModule {}
