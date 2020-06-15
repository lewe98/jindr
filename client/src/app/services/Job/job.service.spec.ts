import { TestBed } from '@angular/core/testing';

import { JobService } from './job.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { Job } from '../../../../interfaces/job';
import { Coords } from '../../../../../server/models/tile';
import { AuthService } from '../Auth/auth.service';
import { User } from '../../../../interfaces/user';

describe('JobService', () => {
  let service: JobService;
  let databaseSpy;
  let authSpy;

  beforeEach(() => {
    databaseSpy = jasmine.createSpyObj('DatabaseControllerService', {
      postRequest: 'postRequest',
      putRequest: 'putRequest'
    });
    authSpy = jasmine.createSpyObj('AuthService', {
      getUser: 'getUser'
    });
    databaseSpy.postRequest.and.returnValue(Promise.resolve(new Job()));
    databaseSpy.putRequest.and.returnValue(Promise.resolve(new Job()));
    authSpy.getUser.and.returnValue(new User());
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: DatabaseControllerService, useValue: databaseSpy },
        { provide: AuthService, useValue: authSpy }]
    });
    service = TestBed.inject(JobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create-job', () => {
    it('should create a Job', (done) => {
      service.createJob('Test', 'test123', new Coords(), './img.jpg').then(async () => {
        expect(databaseSpy.postRequest).toHaveBeenCalledWith(
          'create-job',
          JSON.stringify(
            {
              job: {
                title: 'Test',
                description: 'test123',
                creator: authSpy.getUser,
                location: new Coords(),
                image: './img.jpg'
              }
            }
          ),
          Job
        );
        done();
      });
    });
  });
});
