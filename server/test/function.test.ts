import {describe, it, expect} from 'jest-without-globals';
const server = require('../server.js');

describe('example test', () => {
    it('should test something',() => {
        expect(1).toBe(1);
    });
});
