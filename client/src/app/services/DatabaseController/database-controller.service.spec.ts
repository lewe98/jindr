import { TestBed } from '@angular/core/testing';

import { DatabaseControllerService } from './database-controller.service';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('Database.ControllerService', () => {

  class User {
    name: string;
    age: number;
  }
  let service: DatabaseControllerService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
    }).compileComponents();

    service = TestBed.get(DatabaseControllerService);
  });

  it('DatabaseController should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should only return message if no data is returned', () =>
  {
    const obj = service.convert({message: 'test'}, null);
    expect(obj['data']).toBeUndefined();
    expect(obj.message).toBe('test');
  });

  it('should return single data of expected type', () =>
  {
    let temp = {message: 'test', data: {name: 'user1', age: 12}};
    const obj = service.convert(temp, User);
    expect(obj['data'] instanceof User).toBe(true);
  });

  it('should return data of type object if no type provided', () =>
  {
    let temp = {message: 'test', data: {name: 'user1', age: 12}};
    const obj = service.convert(temp, null);
    expect(typeof(obj['data'])).toEqual('object')
  });

  it('should return array of expected type', () =>
  {
    let temp = {message: 'test', data: [{name: 'user1', age: 12}, {name: 'user2', age: 13}]};
    const obj = service.convert(temp, User);
    expect(obj['data'][0] instanceof User).toBe(true);
    expect(obj.message).toBe('test');
  });
});
