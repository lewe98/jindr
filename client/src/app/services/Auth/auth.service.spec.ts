import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '../../../../interfaces/user';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let databaseSpy;
  beforeEach(() => {
    databaseSpy = jasmine.createSpyObj('DatabaseControllerService', {
      getRequest: 'getRequest',
      postRequest: 'postRequest',
      putRequest: 'putRequest'
    });
    databaseSpy.getRequest.and.returnValue(Promise.resolve(new User()));
    databaseSpy.postRequest.and.returnValue(Promise.resolve(new User()));
    databaseSpy.putRequest.and.returnValue(Promise.resolve(new User()));
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: DatabaseControllerService, useValue: databaseSpy }]
    }).compileComponents();
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should log the user in', (done) => {
      service.login('test@test.de', 'test123').then(async () => {
        expect(databaseSpy.postRequest).toHaveBeenCalledWith(
          'login',
          jasmine.any(String),
          User
        );
        done();
      });
    });

    it('should check if user is logged in', (done) => {
      service.checkLogin().then((result) => {
        expect(databaseSpy.getRequest).toHaveBeenCalledWith(
          'login',
          jasmine.any(String),
          User
        );
        expect(result).toBe(true);
        done();
      });
    });
  });

  describe('Update User', () => {
    it('should make a put request', (done) => {
      const user = new User();
      user.firstName = 'Test';
      service.updateUser(user).then((result) => {
        expect(databaseSpy.putRequest).toHaveBeenCalledWith(
          'update-user',
          JSON.stringify({ user: { firstName: 'Test' }, password: null }),
          User
        );
        done();
      });
    });
  });
});
