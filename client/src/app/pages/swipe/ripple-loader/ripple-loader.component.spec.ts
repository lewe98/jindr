import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RippleLoaderComponent } from './ripple-loader.component';

describe('RippleLoaderComponent', () => {
  let component: RippleLoaderComponent;
  let fixture: ComponentFixture<RippleLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RippleLoaderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RippleLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
