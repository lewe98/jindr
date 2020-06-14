import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ripple-loader',
  templateUrl: './ripple-loader.component.html',
  styleUrls: ['./ripple-loader.component.scss']
})
export class RippleLoaderComponent implements OnInit {
  @Input() imageUrl = 'assets/images/avatar.jpg';

  constructor() {}

  ngOnInit() {}
}
