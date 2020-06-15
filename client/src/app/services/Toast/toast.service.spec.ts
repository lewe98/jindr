import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
