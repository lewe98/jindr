import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobComponent } from './create-job/job.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShellModule } from '../../shell/shell.module';
import { JobDetailComponent } from './job-detail/job-detail.component';
import { OffersComponent } from './offers/offers.component';
import { InfoComponent } from './info/info.component';

const routes: Routes = [
  {
    path: 'create',
    component: JobComponent
  },
  {
    path: 'offers',
    component: OffersComponent
  }
];

@NgModule({
  declarations: [
    JobComponent,
    JobDetailComponent,
    OffersComponent,
    InfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    ShellModule
  ]
})
export class JobModule {}
