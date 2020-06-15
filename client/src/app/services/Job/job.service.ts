import { Injectable } from "@angular/core";
import { AuthService } from "../Auth/auth.service";
import { Job } from "../../../../interfaces/job";
import { DatabaseControllerService } from "../DatabaseController/database-controller.service";

@Injectable({
  providedIn: "root"
})
export class JobService {
  job: Job;

  constructor(
    private authService: AuthService,
    private databaseController: DatabaseControllerService) {
  }

  createJob() {
  }

  /**
   * Method to update a job in the database
   * @param job the job to be updated
   * @param title the title to be updated
   * @param description the description to be updated
   * @param isFinished flag if the job is finished or not
   */
  editJob(job: Job, title: String, description: string, isFinished: Boolean): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      const data = { job, title: title, description: description, isFinished: isFinished };
      this.databaseController
        .putRequest("edit-job", JSON.stringify(data), Job)
        .then((res) => {
          this.job = res.data;
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
