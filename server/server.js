"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var history = require('connect-history-api-fallback');
var bodyParser = require('body-parser');
var compression = require('compression');
var sslRedirect = require('heroku-ssl-redirect');
var cors = require('cors');
var User = require('./models/user');
var MONGODB_URI = process.env.MONGODB_URI;
var MONGODB_NAME = process.env.MONGODB_NAME;
// eslint-disable-next-line
var db;
var app = express();
app.use(sslRedirect());
app.use(compression());
app.use(history());
app.use(express.static(__dirname + '/../client/www'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    credentials: true
    // origin: 'http://localhost:8100' // comment when deploy
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
 * Pass email and password
 * compares stored password and entered password as hash
 * @return 200 User Object
 * @return 400 wrong password or user not found
 */
app.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({ email: email })
        .select('+password')
        .exec(function (err, user) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!err) return [3 /*break*/, 1];
                    res.status(500).send({
                        message: 'Error: ' + err
                    });
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, user.validatePassword(password)];
                case 2:
                    if (_a.sent()) {
                        user = user.toObject();
                        delete user.password;
                        res.status(200).send({
                            message: 'Successfully logged in',
                            data: user
                        });
                    }
                    else {
                        res.status(400).send({
                            message: 'Wrong password'
                        });
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
});
/**
 * Exports for testing
 * add every method like this: {app: app, method1: method1, method2: method2}
 * routes don't need to be added
 */
module.exports = { app: app };
//# sourceMappingURL=server.js.map