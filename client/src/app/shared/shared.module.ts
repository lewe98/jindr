import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JindrButtonComponent } from './jindr-button/jindr-button.component';

@NgModule({
  declarations: [JindrButtonComponent],
  imports: [CommonModule],
  exports: [JindrButtonComponent]
})
export class SharedModule {}
