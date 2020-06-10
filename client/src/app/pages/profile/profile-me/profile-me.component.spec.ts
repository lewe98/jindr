import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProfileMeComponent } from './profile-me.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../../../services/Auth/auth.service';
import { User } from '../../../../../interfaces/user';

describe('ProfileMeComponent', () => {
  let component: ProfileMeComponent;
  let fixture: ComponentFixture<ProfileMeComponent>;
  let authSpy;
  beforeEach(async(() => {
    authSpy = jasmine.createSpyObj('AuthService', {
      getUser: 'getUser'
    });
    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(
      // tslint:disable-next-line
      function () {
        const position = { coords: { latitude: 32.8569, longitude: -96.9628 } };
        arguments[0](position);
      }
    );
    authSpy.getUser.and.returnValue(new User());
    TestBed.configureTestingModule({
      declarations: [ProfileMeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [{ provide: AuthService, useValue: authSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
