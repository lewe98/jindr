import { TestBed } from '@angular/core/testing';

import { ImageService } from './image.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxImageCompressService } from 'ngx-image-compress';

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NgxImageCompressService }]
    });
    service = TestBed.inject(ImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
