import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobComponent } from './create-job/job.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShellModule } from '../../shell/shell.module';
import { JobDetailComponent } from './job-detail/job-detail.component';
import { DisplayJobsComponent } from './display-jobs/display-jobs.component';
import { OffersComponent } from './offers/offers.component';
import { InfoComponent } from './info/info.component';
import { CHAT_VIEW_TOKEN } from '../chat/chat-view/chat-view-token';
import { ChatViewComponent } from '../chat/chat-view/chat-view.component';
import { JOB_DETAIL_TOKEN } from './job-detail/job-detail-token';
import { ApplicationsComponent } from './applications/applications.component';

const routes: Routes = [
  {
    path: 'create',
    component: JobComponent
  },
  {
    path: 'offers',
    component: OffersComponent
  },
  {
    path: 'applications',
    component: ApplicationsComponent
  },
  {
    path: 'edit/:id',
    component: JobComponent
  }
];

@NgModule({
  declarations: [
    JobComponent,
    JobDetailComponent,
    OffersComponent,
    InfoComponent,
    DisplayJobsComponent,
    ApplicationsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    ShellModule
  ],
  providers: [
    { provide: CHAT_VIEW_TOKEN, useValue: ChatViewComponent },
    { provide: JOB_DETAIL_TOKEN, useValue: JobDetailComponent }
  ]
})
export class JobModule {}
