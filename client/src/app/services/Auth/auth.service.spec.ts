import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '../../../../interfaces/user';

describe('AuthService', () => {
  let service: AuthService;
  let databaseSpy;
  beforeEach(() => {
    databaseSpy = jasmine.createSpyObj('DatabaseControllerService', {
      getRequest: 'getRequest'
    });
    databaseSpy.getRequest.and.returnValue(new User());
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: DatabaseControllerService, useValue: databaseSpy }]
    }).compileComponents();
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
