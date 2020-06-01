import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ForgotPwComponent } from './forgot-pw/forgot-pw.component';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';

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
  providers: [ScreenOrientation],
  declarations: [
    LoginPage,
    RegisterPage,
    ForgotPwComponent,
    TermsComponent,
    PrivacyComponent
  ],
  exports: [SharedModule]
})
export class AuthModule {}
