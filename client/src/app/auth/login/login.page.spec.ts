import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login.page';
import {RouterTestingModule} from "@angular/router/testing";
import {AuthService} from "../../services/Auth/auth.service";
import {User} from "../../../../interfaces/user";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let databaseSpy;
  beforeEach(async(() => {
    databaseSpy = jasmine.createSpyObj('AuthService', {
      login: 'login',
    });
    databaseSpy.login.and.returnValue(new User());
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientTestingModule],
      providers: [{provide: AuthService}]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
