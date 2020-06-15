import { TestBed } from '@angular/core/testing';

import { JobService } from './job.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { Job } from '../../../../interfaces/job';
import { Coords } from '../../../../../server/models/tile';

describe('JobService', () => {
  let service: JobService;
  let databaseSpy;

  beforeEach(() => {
    databaseSpy = jasmine.createSpyObj('DatabaseControllerService', {
      postRequest: 'postRequest',
      putRequest: 'putRequest'
    });
    databaseSpy.postRequest.and.returnValue(Promise.resolve(new Job()));
    databaseSpy.putRequest.and.returnValue(Promise.resolve(new Job()));
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: DatabaseControllerService }]
    });
    service = TestBed.inject(JobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create-job', () => {
    it('should create a Job', (done) => {
      service.createJob('Test', 'test123', 'Max', new Coords(), './img.jpg').then(async () => {
        expect(databaseSpy.postRequest).toHaveBeenCalledWith(
          'create-job',
          jasmine.any(String),
          Job
        );
        done();
      });
    });
  });
});
