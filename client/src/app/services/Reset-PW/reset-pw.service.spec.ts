import {TestBed} from '@angular/core/testing';

import {ResetPwService} from './reset-pw.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {IonicModule} from '@ionic/angular';
import {RouterTestingModule} from '@angular/router/testing';

describe('ResetPwService', () => {
    let service: ResetPwService;

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [IonicModule.forRoot(), RouterTestingModule, HttpClientTestingModule]});
        service = TestBed.inject(ResetPwService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
