import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProfileEditComponent } from './profile-edit.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';

describe('ProfileEditComponent', () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;
  let authSpy;

  beforeEach(async(() => {
    authSpy = jasmine.createSpyObj('AuthService', {
      getUser: 'getUser'
    });
    authSpy.getUser.and.returnValue(new User());
    TestBed.configureTestingModule({
      declarations: [ProfileEditComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [{ provide: AuthService, useValue: authSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
