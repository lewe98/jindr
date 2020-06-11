import {describe, it, expect} from 'jest-without-globals';
const server = require('../server.js');
const User = require('../models/user');

describe('Prepare User Test', () => {
    it('should remove password and deviceID',() => {
       const res = server.prepareUser(new User({firstName: 'Test', lastName: 'Test', email: 'test@test.de', password: 'test123', deviceID: 'abc123'}));
       expect(res.password).toBe(undefined);
       expect(res.deviceID).toBe(undefined);
       expect(res.firstName).toBe('Test');
    });
});