"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jest_without_globals_1 = require("jest-without-globals");
var server = require('../server.js');
var User = require('../models/user');
jest_without_globals_1.describe('Prepare User Test', function () {
    jest_without_globals_1.it('should remove password and deviceID', function () {
        var res = server.prepareUser(new User({ firstName: 'Test', lastName: 'Test', email: 'test@test.de', password: 'test123', deviceID: 'abc123' }));
        jest_without_globals_1.expect(res.password).toBe(undefined);
        jest_without_globals_1.expect(res.deviceID).toBe(undefined);
        jest_without_globals_1.expect(res.firstName).toBe('Test');
    });
});
//# sourceMappingURL=function.test.js.map