import {
  Component,
  OnDestroy,
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
import { RouterService } from '../../../services/Router/router.service';
import { SwipeService } from '../../../services/Swipe/swipe.service';
import { Job } from '../../../../../interfaces/job';
import { Subscription } from 'rxjs';
import {
  Coords,
  LocationService
} from '../../../services/Location/location.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy {
  @ViewChild('cardStack', { read: SwingStackComponent, static: false })
  swingStack: SwingStackComponent;
  @ViewChildren('card', { read: SwingCardComponent }) swingCards: QueryList<
    SwingCardComponent
  >;
  cards: Job[];
  stackConfig: StackConfig;
  coordsSub: Subscription;
  coords: Coords;
  constructor(
    private routerService: RouterService,
    private swipeService: SwipeService,
    private locationService: LocationService
  ) {
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

  ngOnDestroy(): void {
    if (this.coordsSub) {
      this.coordsSub.unsubscribe();
    }
  }

  // disables navigation with swipe, to allow user to swipe through jobs
  ionViewDidEnter() {
    this.routerService.toggleSwipeBack(false);
  }
  // enables navigation with swipe again
  ionViewWillLeave() {
    this.routerService.toggleSwipeBack(true);
  }

  /**
   * Gets jobs from the server to show to the user
   */
  ngOnInit() {
    this.coordsSub = this.locationService.coordsSubscription.subscribe(
      (sub) => {
        this.coords = sub;
      }
    );
    this.cards = [];
    this.swipeService.getClientStack().then((res) => {
      this.cards = res;
    });
  }

  /*
   * Handles the card animation
   * Zoom of the bottom card will be disabled if there are no cards left
   * to prevent error
   */
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

    if (this.cards.length > 1) {
      // Zoom effect for the card behind the current one
      const cardBehind = this.swingCards.toArray()[1].getNativeElement();
      cardBehind.style.transform = `scale(${0.94 + 0.06 * calculatedValue}, ${
        0.94 + 0.06 * calculatedValue
      })`;
    }
  }

  /**
   * Method to put a decision in place
   * @param isLike true if job is liked, else false
   * Will add a new card to the stack and remove the first card
   */
  makeDecision(isLike: boolean) {
    this.swipeService
      .makeDecision(this.cards[0]._id, isLike, this.cards.length - 1)
      .then((res) => {
        if (res[0]) {
          this.cards.push(res[0]);
        }
        this.cards.shift();
      });
  }

  onSwipeLeft() {
    if (this.cards.length > 1) {
      const cardBehind = this.swingCards.toArray()[1].getNativeElement();
      cardBehind.style.transform = `scale(1, 1)`;
    }
    this.makeDecision(false);
  }

  onSwipeRight() {
    if (this.cards.length > 1) {
      const cardBehind = this.swingCards.toArray()[1].getNativeElement();
      cardBehind.style.transform = `scale(1, 1)`;
    }
    this.makeDecision(true);
  }

  onDisliked() {
    // Show the NOPE stamp
    const nope = this.swingCards
      .toArray()[0]
      .getNativeElement()
      .querySelector('.stamp-nope');
    nope.style.opacity = 1;
    // Bring the next card to Front
    if (this.cards.length > 1) {
      const cardBehind = this.swingCards.toArray()[1].getNativeElement();
      cardBehind.style.transform = `scale(1, 1)`;
    }

    setTimeout(() => {
      this.makeDecision(false);
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
    if (this.cards.length > 1) {
      const cardBehind = this.swingCards.toArray()[1].getNativeElement();
      cardBehind.style.transform = `scale(1, 1)`;
    }

    setTimeout(() => {
      this.makeDecision(true);
    }, 500);
  }

  // tslint:disable-next-line
  trackByFn(_index: string, item: any) {
    return item._id;
  }

  viewJobDetails(job) {}
}
