import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PagesRoutingModule } from './pages.router.module';
import { HomePage } from './home/home.page';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, PagesRoutingModule],
  declarations: [HomePage]
})
export class TabsPageModule {}
