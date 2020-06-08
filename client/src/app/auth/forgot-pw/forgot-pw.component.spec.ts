import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {ForgotPwComponent} from './forgot-pw.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ForgotPwComponent', () => {
    let component: ForgotPwComponent;
    let fixture: ComponentFixture<ForgotPwComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ForgotPwComponent],
            imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(ForgotPwComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
