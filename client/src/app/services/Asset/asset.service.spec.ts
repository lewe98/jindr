import { TestBed } from '@angular/core/testing';

import { AssetService } from './asset.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';

describe('AssetService', () => {
  let service: AssetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: DatabaseControllerService }]
    });
    service = TestBed.inject(AssetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
