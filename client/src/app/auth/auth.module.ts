import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(authRoutes),
    IonicModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [LoginPage, RegisterPage],
  exports: [SharedModule]
})
export class AuthModule {}
