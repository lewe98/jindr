import {TestBed} from '@angular/core/testing';

import {ResetPwService} from './reset-pw.service';

describe('ResetPwService', () => {
    let service: ResetPwService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ResetPwService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
