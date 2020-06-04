import { TestBed } from '@angular/core/testing';

import { LocationService } from './location.service';
import { HttpBackend } from '@angular/common/http';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HttpBackend }]
    });
    service = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
