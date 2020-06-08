import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavParams } from '@ionic/angular';

import { SettingsComponent } from './settings.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '../../../../../interfaces/user';
import { AuthService } from '../../../services/Auth/auth.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let authSpy;

  beforeEach(async(() => {
    authSpy = jasmine.createSpyObj('AuthService', {
      getUser: 'getUser'
    });
    authSpy.getUser.and.returnValue(new User());
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: NavParams }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
