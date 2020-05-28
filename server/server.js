"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var compression = require('compression');
var cors = require('cors');
var sslRedirect = require('heroku-ssl-redirect');
var history = require('connect-history-api-fallback');
var User = require('./models/user');
var MONGODB_URI = process.env.MONGODB_URI;
var MONGODB_NAME = process.env.MONGODB_NAME;
var ORIGIN_URL = process.env.ORIGIN_URL;
// eslint-disable-next-line
var db;
var app = express();
app.use(compression());
app.use(express.static(__dirname + '/../client/www'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(sslRedirect());
app.use(history());
app.use(cors({
    credentials: true,
    origin: ORIGIN_URL
}));
/**
 * Only starts server if Environment is not test,
 * This is required for Jest Memory Database Tests
 */
app.set('port', process.env.PORT);
/* istanbul ignore next */
if (process.env.NODE_ENV.trim() !== 'test') {
    app.listen(app.get('port'), function () {
        (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // eslint-disable-next-line
                        console.log('Server connected at: ' + app.get('port'));
                        return [4 /*yield*/, dbConnect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })();
    });
}
/* istanbul ignore next */
function dbConnect() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var err_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, mongoose.connect(MONGODB_URI, {
                            useUnifiedTopology: true,
                            useNewUrlParser: true,
                            dbName: MONGODB_NAME
                        })];
                case 1:
                    _a.sent();
                    db = mongoose.connection;
                    // eslint-disable-next-line
                    console.log('Database is connected ...\n');
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    // eslint-disable-next-line
                    console.error('Error connecting to database ...\n' + err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Method to transform Mongoose Error string into an Object
 * @param e Errors as string
 * @return Object of errors
 * Example: e: 'Validation errors: email: Email is required, password: Password is required
 * returns {email: 'Email is required', password: 'Password is required'}
 */
var errorFormatter = function (e) {
    var errors = {};
    var all = e.substring(e.indexOf(':') + 1).trim();
    var allAsArray = all.split(',').map(function (err) { return err.trim(); });
    allAsArray.forEach(function (error) {
        var _a = tslib_1.__read(error.split(':').map(function (err) { return err.trim(); }), 2), key = _a[0], value = _a[1];
        errors[key] = value;
    });
    return errors;
};
/**
 * POST Route to register a new User
 * Pass user in request body with all required fields
 * Method runs Mongoose Validators and writes User to Database
 * @return 201: Successfully created user
 * @return 400: Validation went wrong
 */
app.post('/register', function (req, res) {
    var user = new User();
    user = Object.assign(user, req.body.user);
    user.save(function (err) {
        if (err) {
            res.status(400).send({
                message: 'Something went wrong',
                errors: errorFormatter(err.message)
            });
        }
        else {
            res.status(201).send({
                message: 'Successfully registered'
            });
        }
    });
});
/**
 * POST Route for log in
 * Pass email, password and device ID
 * compares stored password and entered password as hash
 * if they match, the device ID will be stored in the Database for future authentication
 * @return 200 User Object
 * @return 400 wrong password or user not found
 */
app.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var deviceID = req.body.deviceID;
    var opts = { new: true };
    User.findOne({ email: email })
        .select('+password')
        .exec(function (err, user) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var _a;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!err) return [3 /*break*/, 1];
                    res.status(500).send({
                        message: 'Error: ' + err
                    });
                    return [3 /*break*/, 6];
                case 1:
                    _a = user;
                    if (!_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, user.validatePassword(password)];
                case 2:
                    _a = (_b.sent());
                    _b.label = 3;
                case 3:
                    if (!_a) return [3 /*break*/, 5];
                    return [4 /*yield*/, User.findOneAndUpdate({ email: user.email }, { deviceID: deviceID }, opts)];
                case 4:
                    user = _b.sent();
                    user = user.toObject();
                    delete user.password;
                    res.status(200).send({
                        message: 'Successfully logged in',
                        data: user
                    });
                    return [3 /*break*/, 6];
                case 5:
                    res.status(400).send({
                        message: 'Wrong password'
                    });
                    _b.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); });
});
/**
 * GET Route, to validate if User is still logged in.
 * @param deviceID a unique ID of the users device
 * On each Login, a unique Device ID from the used Device will be send to the Server and stored in the Database
 * If this route is called with the currently used device, it will check the database if an user with this device ID
 * already exists. If so, the user is still logged in.
 */
app.get('/login/:deviceID', function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        User.findOne({ deviceID: req.params.deviceID })
            .select('-password')
            .exec(function (err, user) {
            if (err) {
                res.status(500).send({
                    message: 'Error: ' + err
                });
            }
            else {
                if (user) {
                    res.status(200).send({
                        message: 'User still logged in',
                        data: user
                    });
                }
                else {
                    res.status(401).send({
                        message: 'Session expired, please log in again',
                    });
                }
            }
        });
        return [2 /*return*/];
    });
}); });
/**
 * POST route to log out a user
 * @param userID pass the userID from the user
 * checks if userID is a valid mongoose ID
 * deletes deviceID from the database
 */
app.post('/logout', function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        if (mongoose.Types.ObjectId.isValid(req.body.userID)) {
            User.findByIdAndUpdate(req.body.userID, { $set: { deviceID: null } }, { new: true }).then(function () {
                res.status(200).send({
                    message: 'Successfully logged out',
                });
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * Exports for testing
 * add every method like this: {app: app, method1: method1, method2: method2}
 * routes don't need to be added
 *
 */
module.exports = { app: app };
//# sourceMappingURL=server.js.map