"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var server = require('../server.js');
var app = server.app;
var request = require('supertest');
var jest_without_globals_1 = require("jest-without-globals");
var dbHandler = require('./database-handler');
var User = require('../models/user');
var testUser;
/**
 * Connect to a new in-memory database before running any tests.
 */
jest_without_globals_1.beforeAll(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, dbHandler.connect()];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); });
/**
 * Clear all test data after every test.
 */
// afterEach(async () => await dbHandler.clearDatabase());
/**
 * Remove and close the db and server.
 */
jest_without_globals_1.afterAll(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, dbHandler.closeDatabase()];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); });
jest_without_globals_1.describe('Register new User', function () {
    var user1 = new User({ firstName: 'Test', lastName: 'Test1', email: 'abc@abcd.de', password: 'Test123' });
    jest_without_globals_1.it('should create a new user', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/register')
                        .send({
                        user: user1
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(201);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if email exists', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/register')
                        .send({
                        user: user1
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if password is missing', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var user2, res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user2 = new User({ firstName: 'Test', lastName: 'Test1', email: 'abc@abcd.de', password: '' });
                    return [4 /*yield*/, request(app)
                            .post('/register')
                            .send({
                            user: user2
                        })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if email is invalid', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var user2, res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user2 = new User({ firstName: 'Test', lastName: 'Test1', email: 'abc@abcd', password: 'Test123' });
                    return [4 /*yield*/, request(app)
                            .post('/register')
                            .send({
                            user: user2
                        })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
});
jest_without_globals_1.describe('Login User', function () {
    jest_without_globals_1.it('should successfully log in', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/login')
                        .send({
                        email: 'abc@abcd.de',
                        password: 'Test123',
                        deviceID: "abc123abc"
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(typeof res.body.data).toBe('object');
                    testUser = res.body.data;
                    jest_without_globals_1.expect(res.body.data.password).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail with wrong password', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/login')
                        .send({
                        email: 'abc@abcd.de',
                        password: 'Test123456'
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if user does not exist', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/login')
                        .send({
                        email: '123abc@abcd.de',
                        password: 'Test123'
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
});
jest_without_globals_1.describe('Log out user', function () {
    jest_without_globals_1.it('should log out the user', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/logout')
                        .send({
                        userID: testUser._id
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    return [2 /*return*/];
            }
        });
    }); });
});
jest_without_globals_1.describe('Check if user is still logged in', function () {
    jest_without_globals_1.it('should log in', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/login')
                        .send({
                        email: 'abc@abcd.de',
                        password: 'Test123',
                        deviceID: "abc123abc"
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should succeed if deviceID exists', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .get('/login/' + 'abc123abc')
                        .send()];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(typeof res.body.data).toBe('object');
                    testUser = res.body.data;
                    jest_without_globals_1.expect(res.body.data.password).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if deviceID does not exist', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .get('/login/' + 'abc123abc123')
                        .send()];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(401);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=api.test.js.map