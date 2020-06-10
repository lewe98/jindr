import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CurriculumComponent } from './curriculum.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {Component} from '@angular/core';
import { User } from '../../../../../interfaces/user';

describe('CurriculumComponent', () => {
  let component: TestCurriculumComponent;
  let fixture: ComponentFixture<TestCurriculumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CurriculumComponent],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TestCurriculumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  @Component({
    selector: 'app-curriculum',
    template: '<app-curriculum [inputUser]="this.user" [myView]="true"></app-curriculum>'
  })
  class TestCurriculumComponent {
    user = new User();
  }
});
