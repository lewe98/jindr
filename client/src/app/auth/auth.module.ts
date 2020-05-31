import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ForgotPwComponent } from './forgot-pw/forgot-pw.component';

const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  },
  {
    path: 'forgot-pw',
    component: ForgotPwComponent
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
  declarations: [LoginPage, RegisterPage, ForgotPwComponent],
  exports: [SharedModule]
})
export class AuthModule {}
