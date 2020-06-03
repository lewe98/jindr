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
import { FormsModule } from '@angular/forms';
import { CurriculumComponent } from './curriculum/curriculum.component';

const profileRoutes: Routes = [
  {
    path: '',
    component: ProfileMeComponent
  },
  {
    path: 'edit',
    component: ProfileEditComponent
  }
];

@NgModule({
  declarations: [
    ProfileMeComponent,
    SettingsComponent,
    ProfileViewComponent,
    ProfileEditComponent,
    CurriculumComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(profileRoutes),
    IonicModule,
    ShellModule,
    SharedModule,
    FormsModule
  ]
})
export class ProfileModule {}
