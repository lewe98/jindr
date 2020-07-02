import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobComponent } from './create-job/job.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShellModule } from '../../shell/shell.module';
import { JobDetailComponent } from './job-detail/job-detail.component';
import { DisplayJobsComponent } from './display-jobs/display-jobs.component';

const routes: Routes = [
  {
    path: '',
    component: DisplayJobsComponent
  },
  {
    path: 'create',
    component: JobComponent
  },
  {
    path: 'edit/:id',
    component: JobComponent
  }
];

@NgModule({
  declarations: [DisplayJobsComponent, JobComponent, JobDetailComponent],
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
