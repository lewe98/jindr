import { Component, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing.page.html',
  styleUrls: ['landing.page.scss']
})
export class LandingPage {
  @ViewChild('slideWithNav', { static: false }) slideWithNav: IonSlides;

  sliderOne: any;
  slidesOptions: any = {
    zoom: {
      toggle: false
    },
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true
  };
  constructor() {
    this.sliderOne = {
      isBeginningSlide: true,
      isEndSlide: false,
      slidesItems: [
        {
          path: './assets/walkthrough/walkthrough-illustration-1.svg',
          text: 'JINDR'
        },
        {
          path: './assets/walkthrough/walkthrough-illustration-2.svg',
          text: 'BLA BLA'
        }
      ]
    };
  }

  SlideDidChange(object, slideView) {
    this.checkIfNavDisabled(object, slideView);
  }

  checkIfNavDisabled(object, slideView) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }

  checkisBeginning(object, slideView) {
    slideView.isBeginning().then((istrue) => {
      object.isBeginningSlide = istrue;
    });
  }
  checkisEnd(object, slideView) {
    slideView.isEnd().then((istrue) => {
      object.isEndSlide = istrue;
    });
  }
}
