import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { AuthService } from '../../services/Auth/auth.service';
import { User } from '../../../../interfaces/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  user: User = new User();
  sub: Subscription[] = [];
  jobs = 14;
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.sub.push(
      this.authService.user$.subscribe((user) => {
        this.user = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
