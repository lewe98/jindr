import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CurriculumComponent } from '../curriculum/curriculum.component';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  async editCurriculum() {
    const modal = await this.modalCtrl.create({
      component: CurriculumComponent
    });
    return await modal.present();
  }
}
