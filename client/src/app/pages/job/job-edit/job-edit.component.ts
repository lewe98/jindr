import { Component, OnInit } from "@angular/core";
import { JobService } from "../../../services/Job/job.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "../../../services/Toast/toast.service";
import { Job } from "../../../../../interfaces/job";

@Component({
  selector: "app-job-edit",
  templateUrl: "./job-edit.component.html",
  styleUrls: ["./job-edit.component.scss"]
})
export class JobEditComponent implements OnInit {
  job: Job = new Job();
  title: string;
  description: string;
  isFinished: Boolean;

  constructor(
    private jobService: JobService,
    private modalController: ModalController,
    private toastService: ToastService) {
  }

  ngOnInit() {
    Object.assign(this.job,
      // Werte des jeweiligen Jobs aus der Datenbank
      );
  }

  done() {
    if (
      this.job.title !== this.title ||
      this.job.description !== this.description ||
      this.job.isFinished !== this.isFinished
    ) {
      this.jobService.editJob(this.job, this.title, this.description, this.isFinished).catch((err) => {
        this.toastService.presentWarningToast(err.message, "Error");
      });
    }
    this.modalController.dismiss();
  }

  handleScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    // Slide down to go back
    if (scrollTop < 0 && Math.abs(scrollTop) >= 150) {
      this.done();
    }
  }
}
