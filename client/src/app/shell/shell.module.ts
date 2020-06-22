import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { AspectRatioComponent } from './aspect-ratio/aspect-ratio.component';
import { ImageShellComponent } from './image-shell/image-shell.component';
import { TextShellComponent } from './text-shell/text-shell.component';

@NgModule({
  declarations: [AspectRatioComponent, ImageShellComponent, TextShellComponent],
  providers: [],
  imports: [CommonModule, HttpClientModule, IonicModule],
  exports: [AspectRatioComponent, ImageShellComponent, TextShellComponent]
})
export class ShellModule {}
