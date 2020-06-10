import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-swipe-card',
  templateUrl: './swipe-card.component.html',
  styleUrls: ['./swipe-card.component.scss']
})
export class SwipeCardComponent implements OnInit {
  @Input() data: any = {};
  @Input() isPreview = false;
  @Output() viewInfo = new EventEmitter();

  profileImages: object[] = [];

  constructor() {}

  ngOnInit() {
    this.profileImages = [
      { imageUrl: this.data.profile_image_url },
      { imageUrl: 'assets/img/people/thanos.png' },
      { imageUrl: 'assets/img/people/captain.png' },
      { imageUrl: 'assets/img/people/thor.png' }
    ];
  }

  handleViewInfo() {
    this.viewInfo.emit();
  }
}
