import { Component, ViewChild } from '@angular/core';
import { IonSlides, Platform } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
@Component({
  selector: 'app-landing',
  templateUrl: 'landing.page.html',
  styleUrls: ['styles/landing.page.scss', 'styles/responsive.scss']
})
export class LandingPage {
  @ViewChild('slideWithNav', { static: false }) slideWithNav: IonSlides;

  sliderOne: any;
  slidesOptions: any = {
    zoom: {
      toggle: false
    },
    initialSlide: 0,
    loop: true,
    slidesPerView: 1,
    autoplay: true,
    grabCursor: true
  };
  constructor(
    private screenOrientation: ScreenOrientation,
    private platform: Platform
  ) {
    if (!this.platform.is('desktop')) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
    this.sliderOne = {
      isBeginningSlide: true,
      isEndSlide: false,
      slidesItems: [
        {
          path: './assets/images/logo.svg',
          text: ''
        },
        {
          path: './assets/walkthrough/find.svg',
          text: 'Find Jobs in your area with your smartphone!'
        },
        {
          path: './assets/walkthrough/chat.svg',
          text: 'Talk about the details and get the job!'
        },
        {
          path: './assets/walkthrough/work.svg',
          text: 'Do the job!'
        },
        {
          path: './assets/walkthrough/pay.svg',
          text: 'Get paid!'
        }
      ]
    };
  }
}
