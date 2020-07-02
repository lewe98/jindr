import { Injectable } from '@angular/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { ToastService } from '../Toast/toast.service';
import { Job } from '../../../../interfaces/job';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(
    private databaseController: DatabaseControllerService,
    private toastService: ToastService
  ) {}

  /**
   * Method to create a Job
   * @param job the job to create
   * Sends all the user information to the server
   * status message is reported by ToastService
   * resolves if the Job is successfully created in the Database
   * rejects if an error occurred
   */
  createJob(job: Job): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = { job };
      this.databaseController
        .postRequest('create-job', JSON.stringify(data), Job)
        .then((res) => {
          this.toastService.presentToast(res.message);
          resolve();
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.errors, err.message + ': ');
          reject(err);
        });
    });
  }

  /**
   * Method to get one specific job
   * @param id id of the job
   * error message is reported by ToastService
   * resolves if the job could be obtained successfully
   * rejects if an error occurred
   */
  getJobById(id: string): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.databaseController
        .getRequest('get-job-by-id/' + id, '', Job)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.errors, err.message + ': ');
          reject(err);
        });
    });
  }

  /**
   * Method to get all jobs of a certain user
   * @param id id of the user
   * error message is reported by ToastService
   * resolves if the jobs could be obtained successfully
   * rejects if an error occurred
   */
  getJobs(id: string): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.databaseController
        .getRequest('get-jobs/' + id, '', Job)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.errors, err.message + ': ');
          reject(err);
        });
    });
  }

  /**
   * Method to send a put request to the server to update a job
   * @param job job to be updated
   * status message is reported by ToastService
   * resolves if the job is successfully updated in database
   * rejects if an error occurred
   */
  editJob(job: Job): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      const data = { job };
      this.databaseController
        .putRequest('edit-job/' + job._id, JSON.stringify(data), Job)
        .then((res) => {
          this.toastService.presentToast(res.message);
          resolve(res.data);
        })
        .catch((err) => {
          this.toastService.presentWarningToast(
            err.message,
            'An error occurred: '
          );
          reject(err);
        });
    });
  }

  /**
   * Method to delete a job
   * @param id id of the job that is deleted
   * status message is reported by ToastService
   * resolves if the job is successfully removed from database
   * rejects if an error occurred
   */
  deleteJob(id: string): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.databaseController
        .getRequest('delete-job/' + id, '', Job)
        .then((res) => {
          this.toastService.presentToast(res.message);
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.message, +'Error: ');
          reject(err);
        });
    });
  }
}
