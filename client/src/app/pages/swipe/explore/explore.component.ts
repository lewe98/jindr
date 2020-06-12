import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  Direction,
  StackConfig,
  SwingCardComponent,
  SwingStackComponent
} from 'angular2-swing';
import * as _ from 'lodash';
import USERS from './users.dummy';
import { RouterService } from '../../../services/Router/router.service';
@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  @ViewChild('cardStack', { read: SwingStackComponent, static: false })
  swingStack: SwingStackComponent;
  @ViewChildren('card', { read: SwingCardComponent }) swingCards: QueryList<
    SwingCardComponent
  >;
  cards: any[];
  stackConfig: StackConfig;
  jobStack: any[] = USERS;
  constructor(private routerService: RouterService) {
    this.stackConfig = {
      allowedDirections: [Direction.LEFT, Direction.RIGHT],
      // tslint:disable-next-line
      throwOutConfidence: (offsetX, _offsetY, element) => {
        return Math.min(Math.abs(offsetX) / (element.offsetWidth / 2), 1);
      },
      transform: (element, x, y, r) => {
        this.onItemMove(element, x, y, r);
      },
      // tslint:disable-next-line
      throwOutDistance: (_d) => {
        return 800;
      }
    };
  }

  ionViewDidEnter() {
    this.routerService.toggleSwipeBack(false);
  }

  ionViewWillLeave() {
    this.routerService.toggleSwipeBack(true);
  }

  ngOnInit() {
    this.cards = [];
    this.jobStack = USERS;

    setTimeout(() => {
      this.addNewCard();
      this.addNewCard();
    }, 3000);
  }

  addNewCard() {
    const differences = _.difference(this.jobStack, this.cards);
    if (!differences.length) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * differences.length);
    this.cards.push(differences[randomIndex]);
  }

  onItemMove(element: any, x: number, y: number, r: number) {
    const nope = element.querySelector('.stamp-nope');
    const like = element.querySelector('.stamp-like');
    const calculatedValue = Math.min(100, Math.abs(x) - 20) / 100;

    if (x < 0 && Math.abs(x) > 20) {
      nope.style.opacity = calculatedValue;
    } else {
      like.style.opacity = calculatedValue;
    }

    element.style.transform = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;

    // Zoom effect for the card behind the current one
    const cardBehind = this.swingCards.toArray()[1].getNativeElement();
    cardBehind.style.transform = `scale(${0.94 + 0.06 * calculatedValue}, ${
      0.94 + 0.06 * calculatedValue
    })`;
  }

  onSwipeLeft() {
    const cardBehind = this.swingCards.toArray()[1].getNativeElement();
    cardBehind.style.transform = `scale(1, 1)`;

    this.addNewCard();
    const removedCard = this.cards.shift();
  }

  onSwipeRight() {
    const cardBehind = this.swingCards.toArray()[1].getNativeElement();
    cardBehind.style.transform = `scale(1, 1)`;

    this.addNewCard();
    const removedCard = this.cards.shift();
  }

  onDisliked() {
    // Show the NOPE stamp
    const nope = this.swingCards
      .toArray()[0]
      .getNativeElement()
      .querySelector('.stamp-nope');
    nope.style.opacity = 1;
    // Bring the next card to Front
    const cardBehind = this.swingCards.toArray()[1].getNativeElement();
    cardBehind.style.transform = `scale(1, 1)`;

    setTimeout(() => {
      this.addNewCard();
      const removedCard = this.cards.shift();

      console.log('disliked: ' + removedCard.name);
    }, 500);
  }

  onLiked() {
    // Show the LIKE stamp
    const like = this.swingCards
      .toArray()[0]
      .getNativeElement()
      .querySelector('.stamp-like');
    like.style.opacity = 1;
    // Bring the next card to Front
    const cardBehind = this.swingCards.toArray()[1].getNativeElement();
    cardBehind.style.transform = `scale(1, 1)`;

    setTimeout(() => {
      this.addNewCard();
      const removedCard = this.cards.shift();

      console.log('liked: ' + removedCard.name);
    }, 500);
  }

  // tslint:disable-next-line
  trackByFn(_index: string, item: any) {
    return item.id;
  }

  viewJobDetails(job) {}
}
