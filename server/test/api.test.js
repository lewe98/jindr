"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var server = require('../server.js');
var app = server.app;
var request = require('supertest');
var jest_without_globals_1 = require("jest-without-globals");
var dbHandler = require('./database-handler');
var User = require('../models/user');
var EMAIL_ONE = 'email1@test.de';
var EMAIL_TWO = 'email2@test.de';
var DEVICE_ID = 'iphone123pwa';
var PASSWORD_ONE = 'password1';
var PASSWORD_TWO = 'password2';
var USER_ONE = new User({ firstName: 'User1_first', lastName: 'User1_last', email: EMAIL_ONE, password: PASSWORD_ONE });
var USER_TWO = new User({ firstName: 'User2_first', lastName: 'User2_last', email: EMAIL_TWO, password: PASSWORD_TWO });
var LOGGED_IN_USER;
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
function cleanEntries() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    USER_ONE = new User({ firstName: 'User1_first', lastName: 'User1_last', email: EMAIL_ONE, password: PASSWORD_ONE });
                    USER_TWO = new User({ firstName: 'User2_first', lastName: 'User2_last', email: EMAIL_TWO, password: PASSWORD_TWO });
                    return [4 /*yield*/, dbHandler.clearDatabase()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, request(app)
                            .post('/register')
                            .send({
                            user: USER_ONE
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, request(app)
                            .post('/register')
                            .send({
                            user: USER_TWO
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
jest_without_globals_1.describe('Register new User', function () {
    jest_without_globals_1.it('should create a new user', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/register')
                        .send({
                        user: USER_ONE
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
                        user: USER_ONE
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if password is missing', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var noPW, res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    noPW = new User({ firstName: 'Test', lastName: 'Test', email: 'abc@abcd.de', password: '' });
                    return [4 /*yield*/, request(app)
                            .post('/register')
                            .send({
                            user: noPW
                        })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if email is invalid', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var invalidMail, res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidMail = new User({ firstName: 'Test', lastName: 'Test', email: 'abc@abcd', password: 'Test123' });
                    return [4 /*yield*/, request(app)
                            .post('/register')
                            .send({
                            user: invalidMail
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
                        email: EMAIL_ONE,
                        password: PASSWORD_ONE,
                        deviceID: DEVICE_ID
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(typeof res.body.data).toBe('object');
                    LOGGED_IN_USER = res.body.data;
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
                        email: EMAIL_ONE,
                        password: PASSWORD_TWO
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
                        email: 'noemail@test.de',
                        password: PASSWORD_ONE
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
                        userID: LOGGED_IN_USER._id
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
    jest_without_globals_1.it('should fail if deviceID does not exist', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .get('/login/' + DEVICE_ID)
                        .send()];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(401);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should log in', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/login')
                        .send({
                        email: EMAIL_ONE,
                        password: PASSWORD_ONE,
                        deviceID: DEVICE_ID
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
                        .get('/login/' + DEVICE_ID)
                        .send()];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(typeof res.body.data).toBe('object');
                    LOGGED_IN_USER = res.body.data;
                    jest_without_globals_1.expect(res.body.data.password).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
});
jest_without_globals_1.describe('Test Update User', function () {
    jest_without_globals_1.it('should update the user', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    USER_ONE.firstName = 'PutTest';
                    return [4 /*yield*/, request(app)
                            .put('/update-user')
                            .send({ user: USER_ONE })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(res.body.data.firstName).toEqual('PutTest');
                    jest_without_globals_1.expect(res.body.data.lastName).toEqual(USER_ONE.lastName);
                    jest_without_globals_1.expect(res.body.data.password).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if required fields are missing', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    USER_ONE.lastName = '';
                    return [4 /*yield*/, request(app)
                            .put('/update-user')
                            .send({ user: USER_ONE })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    jest_without_globals_1.expect(res.body.errors.lastName).toEqual('Last Name is required.');
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should create a new user', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/register')
                        .send({
                        user: USER_TWO
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(201);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should update if email is changed', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    USER_ONE.lastName = 'User1_last';
                    USER_ONE.email = 'test@emailtest.de';
                    return [4 /*yield*/, request(app)
                            .put('/update-user')
                            .send({ user: USER_ONE })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(res.body.data.email).toEqual('test@emailtest.de');
                    jest_without_globals_1.expect(res.body.data.password).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if email is in use', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    USER_ONE.email = EMAIL_TWO;
                    return [4 /*yield*/, request(app)
                            .put('/update-user')
                            .send({ user: USER_ONE })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    jest_without_globals_1.expect(res.body.errors.email).toEqual('Email already in use.');
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should change password if provided', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .put('/update-user')
                        .send({ user: USER_ONE, password: PASSWORD_TWO })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(res.body.message).toEqual('Password changed');
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should log user in with new password', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/login')
                        .send({
                        email: 'test@emailtest.de',
                        password: PASSWORD_TWO,
                        deviceID: DEVICE_ID
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(typeof res.body.data).toBe('object');
                    LOGGED_IN_USER = res.body.data;
                    jest_without_globals_1.expect(res.body.data.password).toBe(undefined);
                    return [4 /*yield*/, cleanEntries()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
jest_without_globals_1.describe('Test Get User', function () {
    jest_without_globals_1.it('should return user if exists', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .get('/user/' + USER_ONE._id)
                        .send()];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(200);
                    jest_without_globals_1.expect(typeof res.body.data).toBe('object');
                    jest_without_globals_1.expect(res.body.data.password).toBe(undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if user does not exist', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .get('/user/' + '12abc123lkj')
                        .send()];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(404);
                    jest_without_globals_1.expect(res.body.message).toBe('User not found');
                    return [2 /*return*/];
            }
        });
    }); });
});
jest_without_globals_1.describe('Send mail', function () {
    jest_without_globals_1.it('should send a mail', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/sendmail')
                        .send({
                        user: { email: EMAIL_ONE }
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(201);
                    return [2 /*return*/];
            }
        });
    }); });
    jest_without_globals_1.it('should fail if email is invalid', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/register')
                        .send({
                        user: { email: 'John.com' }
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
});
jest_without_globals_1.describe('Get token and expiration date', function () {
    jest_without_globals_1.it('should fail if no token and expiration date is set in server', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/forgot-pw')];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(404);
                    return [2 /*return*/];
            }
        });
    }); });
});
jest_without_globals_1.describe('Reset password', function () {
    jest_without_globals_1.it('should fail if token is invalid, expired or unset', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, request(app)
                        .post('/forgot-pw/a89c41adf3b479af510c36e83274bde9f80ed8dd')
                        .send({
                        user: { password: 'passwort74' }
                    })];
                case 1:
                    res = _a.sent();
                    jest_without_globals_1.expect(res.statusCode).toEqual(400);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=api.test.js.map