import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { NlbrPipe } from './services/nlbr.pipe';
import { AutoResizeDirective } from './services/auto-resize';
import { GifSearchComponent } from './components/gif-search/gif-search';
import { InputWithGiphyComponent } from './components/input-with-giphy/input-with-giphy';

@NgModule({
  declarations: [
    NlbrPipe,
    AutoResizeDirective,
    GifSearchComponent,
    InputWithGiphyComponent
  ],
  imports: [CommonModule, IonicModule, FormsModule, HttpClientModule],
  exports: [
    NlbrPipe,
    AutoResizeDirective,
    GifSearchComponent,
    InputWithGiphyComponent
  ]
})
export class GiphyModule {}
