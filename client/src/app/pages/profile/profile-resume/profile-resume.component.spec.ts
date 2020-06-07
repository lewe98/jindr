import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProfileResumeComponent } from './profile-resume.component';
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe('ProfileResumeComponent', () => {
  let component: ProfileResumeComponent;
  let fixture: ComponentFixture<ProfileResumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileResumeComponent, HttpClientTestingModule ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
