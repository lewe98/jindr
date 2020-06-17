import { Injectable } from '@angular/core';
import { Coords } from '../Location/location.service';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { ToastService } from '../Toast/toast.service';
import { Job } from '../../../../interfaces/job';
import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(
    private databaseController: DatabaseControllerService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  /**
   * Method to create a Job
   * @param title of the Job
   * @param description of the Job
   * @param date of the Job
   * @param time, how long the Job will take
   * @param payment you get for a Job
   * @param location in witch coordinates the Job is located
   * @param image is the url of the Job Image
   * Sends all the user information to the server
   * status message is reported by ToastService
   * resolves if the Job is successfully created in the Database
   * rejects if an error occurred
   */
  createJob(
    title: string,
    description: string,
    date: Date,
    time: number,
    payment: number,
    location: Coords,
    image: string
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = {
        job: {
          title,
          description,
          date,
          time,
          payment,
          creator: this.authService.getUser()._id,
          location,
          image
        }
      };
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

  editJob() {}
}
