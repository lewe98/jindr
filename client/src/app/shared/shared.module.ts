import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JindrButtonComponent } from './jindr-button/jindr-button.component';
import { MapComponent } from './map/map.component';
import { IonicModule } from '@ionic/angular';
import { ShellModule } from '../shell/shell.module';

@NgModule({
  declarations: [JindrButtonComponent, MapComponent],
  imports: [CommonModule, IonicModule, ShellModule],
  exports: [JindrButtonComponent, MapComponent]
})
export class SharedModule {}
