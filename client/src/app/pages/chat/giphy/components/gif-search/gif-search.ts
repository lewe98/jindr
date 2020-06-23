import { Component, Output, EventEmitter } from '@angular/core';
import { GiphyService } from '../../services/giphy.service';

@Component({
  selector: 'app-gif-search',
  templateUrl: './gif-search.html',
  styleUrls: ['./gif-search.scss'],
  providers: [GiphyService]
})
export class GifSearchComponent {
  @Output() doSelect = new EventEmitter();
  @Output() doClose = new EventEmitter();

  gifs: any[] = [];
  isLoading = false;
  query = '';

  constructor(public giphyService: GiphyService) {
    this.getTrending();
  }

  getTrending() {
    this.isLoading = true;

    this.giphyService.trending().subscribe((res) => {
      this.gifs = res.data;
      this.isLoading = false;
    });
  }

  searchGif(query: string) {
    if (query.length === 0) {
      return this.getTrending();
    }
    this.isLoading = true;

    this.giphyService.search(query).subscribe((res) => {
      this.gifs = res.data;
      this.isLoading = false;
    });
  }

  select(gif) {
    this.doSelect.emit(gif.images.downsized_medium.url);
  }

  close() {
    this.query = '';
    this.doClose.emit();
  }
}
