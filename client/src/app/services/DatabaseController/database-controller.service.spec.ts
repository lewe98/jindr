import { TestBed } from '@angular/core/testing';

import { DatabaseControllerService } from './database-controller.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {User} from '../../../../interfaces/user';

describe('Database.ControllerService', () => {
  let service: DatabaseControllerService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
    }).compileComponents();
    // tslint:disable-next-line
    service = TestBed.get(DatabaseControllerService);
  });

  it('DatabaseController should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should only return message if no data is returned', () =>
  {
    const obj = service.convert({message: 'test'}, null);
    expect(obj.data).toBeUndefined();
    expect(obj.message).toBe('test');
  });

  it('should return single data of expected type', () =>
  {
    const temp = {message: 'test', data: {firstName: 'first', lastName: 'last', email: 'first@last.de'}};
    const obj = service.convert(temp, User);
    expect(obj.data instanceof User).toBe(true);
  });

  it('should return data of type object if no type provided', () =>
  {
    const temp = {message: 'test', data: {firstName: 'first', lastName: 'last', email: 'first@last.de'}};
    const obj = service.convert(temp, null);
    expect(typeof(obj.data)).toEqual('object');
  });

  it('should return array of expected type', () =>
  {
    const temp = {message: 'test', data: [{firstName: 'first', lastName: 'last', email: 'first@last.de'}, {firstName: 'first', lastName: 'last', email: 'first@last.de'}]};
    const obj = service.convert(temp, User);
    expect(obj.data[0] instanceof User).toBe(true);
    expect(obj.message).toBe('test');
  });
});
