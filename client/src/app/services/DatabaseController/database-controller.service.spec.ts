import { TestBed } from '@angular/core/testing';

import { DatabaseControllerService } from './database-controller.service';
import { HttpClientModule } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { User } from '../../../../interfaces/user';
import { environment } from '../../../environments/environment';

describe('Database.ControllerService', () => {
  let service: DatabaseControllerService;
  let httpTestingController: HttpTestingController;
  const apiURL = environment.apiUrl;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatabaseControllerService],
      imports: [HttpClientModule, HttpClientTestingModule]
    }).compileComponents();
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DatabaseControllerService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('dataConverter', () => {
    it('should only return message if no data is returned', () => {
      const obj = service.convert({ message: 'test' }, null);
      expect(obj.data).toBeUndefined();
      expect(obj.message).toBe('test');
    });

    it('should return single data of expected type', () => {
      const temp = {
        message: 'test',
        data: { firstName: 'first', lastName: 'last', email: 'first@last.de' }
      };
      const obj = service.convert(temp, User);
      expect(obj.data instanceof User).toBe(true);
    });

    it('should return data of type object if no type provided', () => {
      const temp = {
        message: 'test',
        data: { firstName: 'first', lastName: 'last', email: 'first@last.de' }
      };
      const obj = service.convert(temp, null);
      expect(typeof obj.data).toEqual('object');
    });

    it('should return array of expected type', () => {
      const temp = {
        message: 'test',
        data: [
          { firstName: 'first', lastName: 'last', email: 'first@last.de' },
          {
            firstName: 'first',
            lastName: 'last',
            email: 'first@last.de'
          }
        ]
      };
      const obj = service.convert(temp, User);
      expect(obj.data[0] instanceof User).toBe(true);
      expect(obj.message).toBe('test');
    });
  });

  describe('isJSON', () => {
    it('should return true with valid JSON', () => {
      const data = JSON.stringify({ user: new User() });
      const check = service.isJsonData(data);
      expect(check).toEqual(true);
    });
    it('should return false with invalid JSON', () => {
      const data = 'Hallo';
      const check = service.isJsonData(data);
      expect(check).toEqual(false);
    });
  });
  describe('getRequest', () => {
    it('returned Promise should match the right data', () => {
      const mockUser = {
        data: [
          { firstName: 'first', lastName: 'last', email: 'first@last.de' },
          { firstName: 'first', lastName: 'last', email: 'first@last.de' }
        ],
        message: 'Successfully retrieved UserList'
      };

      service.getRequest('users', '', User).then((data) => {
        expect(data.message).toEqual('Successfully retrieved UserList');
        expect(data.data[0] instanceof User).toBe(true);
      });

      const req = httpTestingController.expectOne(`${apiURL}/users/`);

      expect(req.request.method).toEqual('GET');

      req.flush(mockUser);
    });
  });

  describe('postRequest', () => {
    it('returned Promise should match the right data', () => {
      const mockUser = {
        message: 'Successfully created User'
      };
      const data = JSON.stringify({ user: new User() });
      service.postRequest('add-user', data).then((res) => {
        expect(res.message).toEqual('Successfully created User');
      });

      const req = httpTestingController.expectOne(`${apiURL}/add-user`);

      expect(req.request.method).toEqual('POST');

      req.flush(mockUser);
    });
  });
});
