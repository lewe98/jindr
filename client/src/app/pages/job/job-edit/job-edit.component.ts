import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../services/Job/job.service';
import { Job } from '../../../../../interfaces/job';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-edit',
  templateUrl: './job-edit.component.html',
  styleUrls: ['./job-edit.component.scss']
})
export class JobEditComponent implements OnInit {
  job: Job = new Job();
  editForm: FormGroup;

  constructor(
    private jobService: JobService,
    private router: Router
  ) {}

  // [routerLink]="['/pages/jobs/edit-job/this.job._id']

  ngOnInit() {
    // TODO Werte des jeweiligen Jobs aus der Datenbank assignen
    Object.assign(this.job, this.job);

    this.editForm = new FormGroup({
      title: new FormControl(this.job.title, Validators.required),
      description: new FormControl(this.job.description, Validators.required),
      date: new FormControl(this.job.date, Validators.required),
      time: new FormControl(this.job.time, Validators.required),
      location: new FormControl(this.job.location, Validators.required),
      isFinished: new FormControl(this.job.isFinished, Validators.required)
    });
  }

  selectDate(event) {
    this.job.date = event.detail.value;
  }

  editJobPicture(){
    // TODO edit image
  }

  /**
   * Method to submit values to the editJob-method in job.service.ts
   * resolves if the method was called successfully and navigates to the job overview
   * rejects if an error occurred
   */
  save() {
    return new Promise<any>((resolve, reject) => {
      this.job.title = this.editForm.controls.title.value;
      this.job.description = this.editForm.controls.description.value;
      // this.job.date = this.editForm.controls.date.value;
      this.job.time = this.editForm.controls.time.value;
      this.job.location = this.editForm.controls.location.value;
      this.job.isFinished = this.editForm.controls.isFinished.value;
      this.job.payment = this.editForm.controls.payment.value;

      this.jobService.editJob(this.job).then(() => {
        this.router.navigate(['pages/profile/jobs']);
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  handleScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    // Slide down to go back
    if (scrollTop < 0 && Math.abs(scrollTop) >= 150) {
      this.save();
    }
  }
}
