import { TestBed } from '@angular/core/testing';

import { SwipeService } from './swipe.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('SwipeService', () => {
  let service: SwipeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule]
    });
    service = TestBed.inject(SwipeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
