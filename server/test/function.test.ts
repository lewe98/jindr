import {describe, it, expect} from 'jest-without-globals';
const server = require('../server.js');

describe('Sample Test', () => {
    it('should test that true === true',  () => {
        let res = server.test(1 ,2 )
        expect(res).toBe(3);
    });
});
