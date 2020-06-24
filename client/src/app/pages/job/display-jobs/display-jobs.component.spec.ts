import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DisplayJobsComponent } from './display-jobs.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DisplayJobsComponent', () => {
  let component: DisplayJobsComponent;
  let fixture: ComponentFixture<DisplayJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayJobsComponent],
      imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
