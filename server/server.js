"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var compression = require('compression');
var cors = require('cors');
var bcrypt = require('bcrypt');
var sslRedirect = require('heroku-ssl-redirect');
var history = require('connect-history-api-fallback');
var SALT_WORK_FACTOR = 10;
var fs = require('fs');
var AWS = require('aws-sdk');
var nodemailer = require('nodemailer');
var User = require('./models/user');
var MONGODB_URI = process.env.MONGODB_URI;
var MONGODB_NAME = process.env.MONGODB_NAME;
var ORIGIN_URL = process.env.ORIGIN_URL;
var s3 = new AWS.S3({
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY
});
// eslint-disable-next-line
var db;
var app = express();
app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(sslRedirect(['staging', 'production']));
app.use(history());
app.use(express.static(__dirname + '/../client/www'));
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
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, mongoose.connect(MONGODB_URI, {
                            useUnifiedTopology: true,
                            useNewUrlParser: true,
                            dbName: MONGODB_NAME,
                            useFindAndModify: false
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
        var _a = error.split(':').map(function (err) { return err.trim(); }), key = _a[0], value = _a[1];
        errors[key] = value;
    });
    return errors;
};
/**
 * @api {post} /register Registers a new User
 * @apiName RegisterUser
 * @apiGroup User
 *
 * @apiDescription Pass user in request body with all required fields
 * Method runs Mongoose Validators and writes User to Database
 *
 * @apiParam {String} user An object with firstName, lastName, email and password
 *
 * @apiSuccess {String} message  SuccessMessage if all required fields passed and user is registered
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Successfully registered",
 *     }
 *
 * @apiError UserNotRegistered If one of the required fields is missing or does not match the criteria
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message: "Something went wrong",
 *       "errors": an Array of Errors
 *     }
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
 * @api {post} /login Loggs a user in
 * @apiName LogIn
 * @apiGroup User
 *
 * @apiDescription Pass email, password and device ID compares stored password and entered password as hash
 * if they match, the device ID will be stored in the Database for future authentication and it will
 * return the User
 *
 * @apiParam {String} deviceID A truly unique ID from the users device
 * @apiParam {String} password the Password of the user
 * @apiParam {String} email the Email of the user
 *
 * @apiSuccess {String} message  SuccessMessage if email and password match
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Successfully logged in",
 *       "data": user
 *     }
 */
app.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var deviceID = req.body.deviceID;
    var opts = { "new": true };
    User.findOne({ email: email })
        .select('+password')
        .exec(function (err, user) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
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
                    res.status(200).send({
                        message: 'Successfully logged in',
                        data: prepareUser(user)
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
 * @api {get} /login/:deviceID Checks if user if deviceID is still logged in
 * @apiName CheckLogIn
 * @apiGroup User
 *
 * @apiDescription On each Login, a unique Device ID from the used Device will be send to the Server and stored in the Database
 * If this route is called with the currently used device, it will check the database if an user with this device ID
 * already exists. If so, the user is still logged in
 *
 * @apiParam {String} deviceID A truly unique ID from the users device
 *
 * @apiSuccess {String} message  SuccessMessage if user is still logged in.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "User still logged in",
 *       "data": user
 *     }
 */
app.get('/login/:deviceID', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
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
                        message: 'Session expired, please log in again'
                    });
                }
            }
        });
        return [2 /*return*/];
    });
}); });
/**
 * @api {post} /logout Log out user
 * @apiName LogoutUser
 * @apiGroup User
 *
 * @apiDescription checks if userID is a valid mongoose ID.
 * deletes deviceID from the database
 *
 * @apiParam {String} userID ID of the user
 *
 * @apiSuccess {String} message  SuccessMessage.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Successfully logged out"
 *     }
 */
app.post('/logout', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (mongoose.Types.ObjectId.isValid(req.body.userID)) {
            User.findByIdAndUpdate(req.body.userID, { $set: { deviceID: null } }, { "new": true }).then(function () {
                res.status(200).send({
                    message: 'Successfully logged out'
                });
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @api {put} /update-user Updated user in the Database
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiDescription All fields will be validated with mongoose validator and database will be
 * updated. If a password is passed, only the password is hashed and updated
 *
 * @apiParam {String} user JSON String with user
 * @apiParam {String} password Optional new password
 *
 * @apiSuccess {Object} data Contains the modified user.
 * @apiSuccess {String} message  SuccessMessage.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": user,
 *       "message": "Updated User"
 *     }
 */
app.put('/update-user', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var doc, data, _i, _a, _b, key, value, hash, e_1, e_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                data = {};
                // eslint-disable-next-line no-loops/no-loops
                for (_i = 0, _a = Object.entries(req.body.user); _i < _a.length; _i++) {
                    _b = _a[_i], key = _b[0], value = _b[1];
                    if (key !== '_id') {
                        data[key] = value;
                    }
                }
                if (!mongoose.Types.ObjectId.isValid(req.body.user._id)) return [3 /*break*/, 9];
                if (!req.body.password) return [3 /*break*/, 6];
                return [4 /*yield*/, bcrypt.hashSync(req.body.password, SALT_WORK_FACTOR)];
            case 1:
                hash = _c.sent();
                _c.label = 2;
            case 2:
                _c.trys.push([2, 4, , 5]);
                return [4 /*yield*/, User.findOneAndUpdate({ _id: req.body.user._id }, { password: hash }, { "new": true })];
            case 3:
                doc = _c.sent();
                res.status(200).send({
                    message: 'Password changed',
                    data: prepareUser(doc)
                });
                return [3 /*break*/, 5];
            case 4:
                e_1 = _c.sent();
                res.status(400).send({
                    message: 'Something went wrong',
                    errors: errorFormatter(e_1.message)
                });
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 9];
            case 6:
                _c.trys.push([6, 8, , 9]);
                return [4 /*yield*/, User.findOneAndUpdate({ _id: req.body.user._id }, data, {
                        "new": true,
                        context: 'query'
                    })];
            case 7:
                doc = _c.sent();
                res.status(200).send({
                    message: 'Updated User',
                    data: prepareUser(doc)
                });
                return [3 /*break*/, 9];
            case 8:
                e_2 = _c.sent();
                res.status(400).send({
                    message: 'Something went wrong',
                    errors: errorFormatter(e_2.message)
                });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
/**
 * @api {get} /user/:userID Returns user with provided ID
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiDescription Returns the user with the requested ID from the database
 *
 * @apiParam {String} userID The ID of the requested user
 *
 * @apiSuccess {String} message  SuccessMessage if user is found
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "User retrieved",
 *       "data": user
 *     }
 */
app.get('/user/:userID', function (req, res) {
    User.findOne({ _id: req.params.userID })
        .select('-password -deviceID')
        .exec(function (err, user) {
        if (err) {
            res.status(404).send({
                message: 'User not found',
                errors: err
            });
        }
        else {
            res.status(200).send({
                message: 'User retrieved',
                data: user
            });
        }
    });
});
/**
 * @api {post} /upload-image Uploads image to AWS and returns URL
 * @apiName UploadImage
 * @apiGroup Images
 *
 * @apiDescription Uploads a base64 Image to the AWS S3 Bucket and returns the path, so it can
 * be saved in the corresponding object
 *
 * @apiParam {String} file Base64 Image
 * @apiParam {String} name This is the name of the image in the Bucket and MUST BE UNIQUE
 *
 * @apiSuccess {String} message  SuccessMessage if image saved
 * @apiSuccess {String} data The URL to the image
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Image saved",
 *       "data": url
 *     }
 */
app.post('/upload-image', function (req, res) {
    var name = req.body.name;
    var file = req.body.file;
    uploadFile(file, name)
        .then(function (result) {
        res.status(201).send({
            message: 'Image saved',
            data: result
        });
    })["catch"](function (err) {
        res.status(500).send({
            message: 'Upload failed',
            errors: err
        });
    });
});
/**
 * @api {post} /sendmail sends mail containing a link to reset password
 * @apiName SendMail
 * @apiGroup Mail
 *
 * @apiDescription Pass mail in request body.
 * The configured mail client sends a mail to the users mailing address.
 *
 * @apiParam {String} mail User's mailing address
 *
 * @apiSuccess {String} message Notification that the mail has been sent successfully.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       message: 'Mail has been sent: ' + info.messageId
 *     }
 *
 * @apiError InvalidInput Method fails if user transmits an invalid mailing address.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message: 'Could not send mail!',
 *       "errors": an Array of Errors
 *     }
 */
app.post('/sendmail', function (req, res) {
    var email = req.body.user.email;
    // eslint-disable-next-line
    var html = "<a href=\"https://google.com\">Click here to reset your password.</a>";
    var transporter = nodemailer.createTransport({
        host: 'smtp.web.de',
        port: 587,
        secure: false,
        auth: {
            user: 'app.jindr@web.de',
            pass: 'JindrPW1!'
        }
    });
    var mailOptions = {
        from: 'jindr Support app.jindr@web.de',
        to: email,
        subject: 'jindr - Reset password',
        html: html
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            res.status(400).send({
                message: 'Could not send mail!',
                errors: err.toString()
            });
        }
        else {
            res.status(201).send({
                message: 'Mail has been sent: ' + info.messageId
            });
        }
    });
});
/**
 * Prepares user to be sent to client
 * Removes password and deviceID
 * @param user to be prepared
 * @return user without password and deviceID
 */
function prepareUser(user) {
    user = user.toObject();
    delete user.password;
    delete user.deviceID;
    return user;
}
/**
 * Method to upload a file to the AWS S3 Bucket
 * @param file the file as base64 string
 * @param name the image name in the bucket. Should be UNIQUE! e.g. use Timestamp
 */
function uploadFile(file, name) {
    return new Promise(function (resolve, reject) {
        var params;
        var base64Image = file.split(';base64,').pop();
        fs.writeFile('image.png', base64Image, { encoding: 'base64' }, function () {
            var fileContent = fs.readFileSync('image.png');
            params = {
                Bucket: 'jindr-images',
                Key: name,
                Body: fileContent,
                ContentType: 'image/jpeg',
                ACL: 'public-read'
            };
            s3.upload(params, function (error, data) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data.Location);
                    return data.Location;
                }
            });
        });
    });
}
/**
 * Exports for testing
 * add every method like this: {app: app, method1: method1, method2: method2}
 * routes don't need to be added
 *
 */
module.exports = { app: app, prepareUser: prepareUser };
