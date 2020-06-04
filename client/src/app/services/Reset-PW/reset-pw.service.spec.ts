import { TestBed } from '@angular/core/testing';

import { ResetPwService } from './reset-pw.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ResetPwService', () => {
  let service: ResetPwService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ResetPwService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
