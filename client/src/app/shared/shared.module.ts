import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JindrButtonComponent } from './jindr-button/jindr-button.component';
import { MapComponent } from './map/map.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [JindrButtonComponent, MapComponent],
  imports: [CommonModule, IonicModule],
  exports: [JindrButtonComponent, MapComponent]
})
export class SharedModule {}
