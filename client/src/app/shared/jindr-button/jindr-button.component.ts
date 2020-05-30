import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-jindr-button',
  templateUrl: './jindr-button.component.html',
  styleUrls: ['./jindr-button.component.scss']
})
export class JindrButtonComponent implements OnInit {
  @Input() text: string;
  @Input() disabled = false;
  constructor() {}

  ngOnInit() {}
}
