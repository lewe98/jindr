import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LandingPage } from './landing.page';
import { ShellModule } from '../shell/shell.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShellModule,
    RouterModule.forChild([{ path: '', component: LandingPage }])
  ],
  declarations: [LandingPage]
})
export class LandingPageModule {}
