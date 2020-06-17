import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobComponent } from './create-job/job.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShellModule } from "../../shell/shell.module";

const routes: Routes = [
  {
    path: 'create',
    component: JobComponent
  }
];

@NgModule({
  declarations: [JobComponent],
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
