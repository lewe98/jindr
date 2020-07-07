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
  const editedJob = new Job();

  beforeEach(() => {
    databaseSpy = jasmine.createSpyObj('DatabaseControllerService', {
      postRequest: 'postRequest',
      putRequest: 'putRequest',
      getRequest: 'getRequest'
    });
    authSpy = jasmine.createSpyObj('AuthService', {
      getUser: 'getUser'
    });
    databaseSpy.postRequest.and.returnValue(Promise.resolve(new Job()));
    databaseSpy.putRequest.and.returnValue(Promise.resolve(new Job()));
    databaseSpy.getRequest.and.returnValue(Promise.resolve(new Job()));
    authSpy.getUser.and.returnValue(new User());
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: DatabaseControllerService, useValue: databaseSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });
    service = TestBed.inject(JobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create and get job', () => {
    it('should create a job', (done) => {
      const job = new Job();
      job.title = 'Test';
      job.description = 'test123';
      job.date = new Date(2012);
      job.location = new Coords();
      job.image = './img.jpg';
      job.payment = 12;
      job.time = 8;
      service.createJob(job).then(async () => {
        expect(databaseSpy.postRequest).toHaveBeenCalledWith(
          'create-job',
          JSON.stringify({
            job: {
              title: 'Test',
              description: 'test123',
              date: new Date(2012),
              location: new Coords(),
              image: './img.jpg',
              payment: 12,
              time: 8,
              creator: authSpy.getUser
            }
          }),
          Job
        );
        done();
      });
    });
    it('should get a job by id', (done) => {
      service.getJobById('test123').then(async () => {
        expect(databaseSpy.getRequest).toHaveBeenCalledWith(
          'get-job-by-id/test123',
          '',
          Job
        );
        done();
      });
    });
    it('should get all jobs from a specific user', (done) => {
      service.getJobs('test123').then(async () => {
        expect(databaseSpy.getRequest).toHaveBeenCalledWith(
          'get-jobs/test123',
          '',
          Job
        );
        done();
      });
    });
  });

  describe('edit-job', () => {
    it('should edit a Job', (done) => {
      service.editJob(editedJob, '74387523').then(async () => {
        expect(databaseSpy.putRequest).toHaveBeenCalledWith(
          'edit-job/' + editedJob._id,
          JSON.stringify({ job: editedJob }),
          Job
        );
        done();
      });
    });
  });

  describe('get liked unfinished jobs of a User', () => {
    it('should get liked Jobs', (done) => {
      service.getLikedJobs('test1234').then(async () => {
        expect(databaseSpy.getRequest).toHaveBeenCalledWith(
          'get-liked-jobs/test1234',
          '',
          Job
        );
        done();
      });
    });
  });

  describe('get liked finished jobs of a User', () => {
    it('should get finished Jobs of a user', (done) => {
      service.getAcceptedJobs('test1234').then(async () => {
        expect(databaseSpy.getRequest).toHaveBeenCalledWith(
          'get-accepted-jobs/test1234',
          '',
          Job
        );
        done();
      });
    });
  });
});
