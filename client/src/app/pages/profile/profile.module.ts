import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileMeComponent } from './profile-me/profile-me.component';
import { SettingsComponent } from './settings/settings.component';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShellModule } from '../../shell/shell.module';
import { SharedModule } from '../../shared/shared.module';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurriculumComponent } from './curriculum/curriculum.component';
import { ProfileResumeComponent } from './profile-resume/profile-resume.component';
import { JobEditComponent } from '../job/job-edit/job-edit.component';

const profileRoutes: Routes = [
  {
    path: '',
    component: ProfileMeComponent
  },
  {
    path: 'edit',
    component: ProfileEditComponent
  },
  {
    path: 'jobs/edit-job/:id',
    component: JobEditComponent
  }
];

@NgModule({
  declarations: [
    ProfileMeComponent,
    SettingsComponent,
    ProfileViewComponent,
    ProfileEditComponent,
    CurriculumComponent,
    ProfileResumeComponent,
    JobEditComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(profileRoutes),
    IonicModule,
    ShellModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ProfileModule {}
