import {describe, it, expect, beforeAll, afterAll} from 'jest-without-globals';
const server = require('../server.js');

describe('Sample Test', () => {
    it('should test that true === true',  () => {

        expect(3).toBe(3);
    });
});
