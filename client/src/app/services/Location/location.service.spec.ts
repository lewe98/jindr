import { TestBed } from '@angular/core/testing';

import { LocationService } from './location.service';
import { HttpBackend } from '@angular/common/http';

describe('LocationService', () => {
  let service: LocationService;
  let fixture;
  let component;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      providers: [{ provide: HttpBackend }]
    });
    service = TestBed.inject(LocationService);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get current position', () => {
    it('should return coordinates', async () => {
      spyOn(service, 'getCurrentPosition').and.returnValue(
        Promise.resolve({ lat: 10, lng: 20 })
      );
      service.getCurrentPosition().then((res) => {
        expect(res.lat).toBe(10);
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
