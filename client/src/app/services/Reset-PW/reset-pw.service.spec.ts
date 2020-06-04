import {TestBed} from '@angular/core/testing';

import {ResetPwService} from './reset-pw.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../shared/shared.module';
import {AppModule} from '../../app.module';

describe('ResetPwService', () => {
    let service: ResetPwService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [SharedModule, AppModule],
            providers: []
        });
        service = TestBed.inject(ResetPwService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
