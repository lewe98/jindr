import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PagesRoutingModule } from './pages.router.module';
import { HomePage } from './home/home.page';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PagesRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule
  ],
  declarations: [HomePage],
  exports: [SharedModule]
})
export class PagesModule {}
