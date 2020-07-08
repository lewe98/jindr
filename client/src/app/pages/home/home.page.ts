import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { AuthService } from '../../services/Auth/auth.service';
import { User } from '../../../../interfaces/user';
import { Subscription } from 'rxjs';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core';
import { ToastService } from '../../services/Toast/toast.service';
import { Router } from '@angular/router';
import { AssetService } from '../../services/Asset/asset.service';
import { LocationService } from '../../services/Location/location.service';
import { SocketService } from '../../services/Socket/socket.service';
import { ChatService } from '../../services/Chat/chat.service';

const { PushNotifications } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  user: User = new User();
  sub: Subscription[] = [];
  accuracy;
  unread = 0;
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private authService: AuthService,
    public platform: Platform,
    private toastService: ToastService,
    private router: Router,
    private assetService: AssetService,
    private locationService: LocationService,
    private socketService: SocketService,
    private chatService: ChatService
  ) {}

  async ngOnInit() {
    this.sub.push(
      this.authService.user$.subscribe((user) => {
        this.user = user;
      })
    );
    this.sub.push(
      this.locationService.accuracySubscription?.subscribe((acc) => {
        this.accuracy = acc;
      })
    );
    this.sub.push(
      this.chatService.unread$.subscribe((r) => {
        this.unread = r;
      })
    );
    this.registerPush();
    this.assetService.setInterests();
    this.socketService.connect(this.authService.user?._id);
  }

  ngOnDestroy(): void {
    this.sub.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  registerPush() {
    if (this.platform.is('android')) {
      PushNotifications.requestPermission().then((result) => {
        if (result.granted) {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        }
      });
      PushNotifications.addListener(
        'registration',
        (token: PushNotificationToken) => {
          this.authService.registerPushNotifications(token.value);
        }
      );

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotification) => {
          this.toastService.presentNotification(
            notification.title,
            notification.body,
            notification.link
          );
        }
      );

      // Method called when tapping on a notification
      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: PushNotificationActionPerformed) => {
          this.router.navigate([notification.notification.link]);
        }
      );
    }
  }
}
