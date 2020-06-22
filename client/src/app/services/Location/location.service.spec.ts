import { TestBed } from '@angular/core/testing';

import { LocationService } from './location.service';
import { HttpBackend } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { User } from '../../../../interfaces/user';
import { AuthService } from '../Auth/auth.service';

describe('LocationService', () => {
  let service: LocationService;
  let fixture;
  let authSpy;
  let component;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', {
      getUser: 'getUser'
    });
    authSpy.getUser.and.returnValue(new User());
    fixture = TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: HttpBackend },
        { provide: AuthService, useValue: authSpy }
      ]
    });
    service = TestBed.inject(LocationService);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get current position', () => {
    it('should return coordinates', async () => {
      spyOn(service, 'reverseGeocode').and.returnValue(
        Promise.resolve('Gießen')
      );
      service.reverseGeocode({ lat: 50.58727, lng: 8.67554 }).then((res) => {
        expect(res).toBe('Gießen');
      });
    });
  });

  describe('test distance between coordinates', () => {
    it('should calculate the distance', () => {
      // distance between gießen and frankfurt with haversine = 52.476km
      const dist = service.getDistanceFromLatLonInKm(
        50.58727,
        8.67554,
        50.11552,
        8.68417
      );
      expect(Math.floor(dist)).toBe(52);
    });
  });
});
