import { EventEmitter, Injectable } from '@angular/core';
import { DatabaseControllerService } from '../DatabaseController/database-controller.service';
import { ToastService } from '../Toast/toast.service';
import { Job } from '../../../../interfaces/job';
import { BehaviorSubject } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  public $newJobOffer: EventEmitter<any> = new EventEmitter();
  allJobs: Job[] = [];
  private allJobsSub: BehaviorSubject<Job[]> = new BehaviorSubject<Job[]>(
    this.allJobs
  );
  $allJobs = this.allJobsSub.asObservable();
  unreadSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  unread$ = this.unreadSubject.asObservable();

  constructor(
    private databaseController: DatabaseControllerService,
    private toastService: ToastService,
    private alertController: AlertController
  ) {
  }

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
  getJobs(id: string): Promise<Job[]> {
    return new Promise<Job[]>((resolve, reject) => {
      this.databaseController
        .getRequest('get-jobs/' + id, '', Job)
        .then((res) => {
          this.allJobs = res.data;
          this.countUnread();
          resolve(res.data);
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.errors, err.message + ': ');
          reject(err);
        });
    });
  }

  /**
   * Counts all unseen likes of each job
   */
  countUnread() {
    let unreadCount = 0;
    if (this.allJobs?.length) {
      this.allJobs.map((c) => {
        const tmp = c.interestedUsers.filter((m) => m.time > c.lastViewed);
        c.unread = tmp.length;
        unreadCount += tmp.length;
      });
      this.unreadSubject.next(unreadCount);
      this.allJobsSub.next(this.allJobs);
    } else {
      this.allJobs = [];
      this.allJobsSub.next(this.allJobs);
      this.unreadSubject.next(0);
    }
  }

  /**
   * Method to send a put request to the server to update a job
   * @param job job to be updated
   * status message is reported by ToastService
   * resolves if the job is successfully updated in database
   * rejects if an error occurred
   */
  editJob(job: Job, userID: string): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      const data = { job };
      this.databaseController
        .putRequest('edit-job/' + job._id, JSON.stringify(data), Job)
        .then((res) => {
          this.getJobs(userID);
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
  deleteJob(id: string, userID: string): Promise<Job> {
    return new Promise<Job>((resolve, reject) => {
      this.databaseController
        .getRequest('delete-job/' + id, '', Job)
        .then((res) => {
          this.getJobs(userID);
          this.toastService.presentToast(res.message);
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.message, +'Error: ');
          reject(err);
        });
    });
  }

  /**
   * Method to make a JobOffer
   * @param jobId Id of the Job which get updated
   * @param userId userId from the user who gets the JobOffer
   * @param wrapperId the Id of the actual wrapper
   */
  makeOffer(jobId, userId, wrapperId) {
    return new Promise<any>((resolve, reject) => {
      const data = JSON.stringify({
        jobId: jobId.toString(),
        userId: userId.toString(),
        wrapperId: wrapperId.toString()
      });
      this.databaseController
        .putRequest('make-jobOffer', data)
        .then((res) => {
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
   *
   * @param jobId Id of the Job which get updated
   * @param userId userId of the employer
   * @param wrapperId the Id of the actual wrapper
   * @param reaction boolean: (true= JobOffer accepted, false= JobOffer denied)
   */
  reactOffer(jobId, userId, wrapperId, reaction, offerID) {
    return new Promise<any>((resolve, reject) => {
      const data = JSON.stringify({
        jobId: jobId.toString(),
        userId,
        wrapperId: wrapperId.toString(),
        jobOfferAccepted: reaction,
        offerID: offerID.toString()
      });
      this.databaseController
        .putRequest('reaction-jobOffer', data)
        .then((res) => {
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
   *
   * @param jobId Id of the Job which get updated
   * @param userId userId from the user of the JobOffer
   * @param wrapperId the Id of the actual wrapper
   */
  rejectOffer(jobId, userId, wrapperId) {
    return new Promise<any>((resolve, reject) => {
      const data = JSON.stringify({
        jobId: jobId.toString(),
        userId: userId.toString(),
        wrapperId: wrapperId.toString()
      });
      this.databaseController
        .putRequest('reject-jobOffer', data)
        .then((res) => {
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

  updateJob(job) {
    this.$newJobOffer.emit(job);
  }

  async markAsFinished(job: Job, userID: string) {
    const alert = await this.alertController.create({
      cssClass: '',
      header: 'Mark as finished?',
      message:
        'Do you really want to mark this job as <strong>finished</strong>? ' +
        'People will no longer see this job in their feed and you wont get any new help requests.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Okay',
          handler: () => {
            job.isFinished = true;
            this.editJob(job, userID);
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Method to get all liked jobs of a certain user
   * @param userId id of the user
   * error message is reported by ToastService
   * resolves if the jobs could be obtained successfully
   * rejects if an error occurred
   */
  getLikedAcceptedJobs(userId: string): Promise<{ likedJobs: {}[], acceptedJobs: {}[] }> {
    return new Promise<{ likedJobs: {}[], acceptedJobs: {}[] }>((resolve, reject) => {
      this.databaseController
        .getRequest('get-liked-jobs', userId)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          this.toastService.presentWarningToast(err.errors, err.message + ': ');
          reject(err);
        });
    });
  }
}
