import { Injectable } from "@angular/core";
import { Coords } from "../Location/location.service";
import { DatabaseControllerService } from "../DatabaseController/database-controller.service";
import { ToastService } from "../Toast/toast.service";
import { Job } from '../../../../interfaces/job';

@Injectable({
  providedIn: "root"
})
export class JobService {
  constructor(
    private databaseController: DatabaseControllerService,
    private toastService: ToastService
  ) {
  }

  /**
   * Method to create a Job
   * @param title of the Job
   * @param description of the Job
   * @param creator of the Job
   * @param location in witch coordinates the Job is located
   * @param image is the url of the Job Image
   * Sends all the user information to the server
   * status message is reported by ToastService
   * resolves if the Job is successfully created in the Database
   * rejects if an error occurred
   */
  createJob(title: string, description: string, creator: string, location: Coords, image: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = {
        job: {
          title,
          description,
          creator,
          location,
          image
        },
        BASE_URL: document.location.origin
      };
      this.databaseController
        .postRequest("create-job", JSON.stringify(data))
        .then((res) => {
          this.toastService.presentToast(res.message);
          resolve();
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.errors, err.message + ": ");
          reject(err);
        });
    });
  }


  editJob() {}
}
