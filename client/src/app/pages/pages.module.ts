import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PagesRoutingModule } from './pages.router.module';
import { HomePage } from './home/home.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PagesRoutingModule,
    SharedModule
  ],
  declarations: [HomePage],
  exports: [SharedModule]
})
export class TabsPageModule {}
