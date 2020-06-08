"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
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
var crypto = require('crypto');
var User = require('./models/user');
var token;
var expirationDate;
var MONGODB_URI = process.env.MONGODB_URI;
var MONGODB_NAME = process.env.MONGODB_NAME;
var ORIGIN_URL = process.env.ORIGIN_URL;
var AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
var AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});
var s3 = new AWS.S3();
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
        var _a = tslib_1.__read(error.split(':').map(function (err) { return err.trim(); }), 2), key = _a[0], value = _a[1];
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
                        data: prepareUser(user)
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
app.post('/logout', function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        if (mongoose.Types.ObjectId.isValid(req.body.userID)) {
            User.findByIdAndUpdate(req.body.userID, { $set: { deviceID: null } }, { new: true }).then(function () {
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
app.put('/update-user', function (req, res) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var doc, data, _a, _b, _c, key, value, hash, e_1, e_2;
    var e_3, _d;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                data = {};
                try {
                    // eslint-disable-next-line no-loops/no-loops
                    for (_a = tslib_1.__values(Object.entries(req.body.user)), _b = _a.next(); !_b.done; _b = _a.next()) {
                        _c = tslib_1.__read(_b.value, 2), key = _c[0], value = _c[1];
                        if (key !== '_id') {
                            data[key] = value;
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                if (!mongoose.Types.ObjectId.isValid(req.body.user._id)) return [3 /*break*/, 9];
                if (!req.body.password) return [3 /*break*/, 6];
                return [4 /*yield*/, bcrypt.hashSync(req.body.password, SALT_WORK_FACTOR)];
            case 1:
                hash = _e.sent();
                _e.label = 2;
            case 2:
                _e.trys.push([2, 4, , 5]);
                return [4 /*yield*/, User.findOneAndUpdate({ _id: req.body.user._id }, { password: hash }, { new: true })];
            case 3:
                doc = _e.sent();
                res.status(200).send({
                    message: 'Password changed',
                    data: prepareUser(doc)
                });
                return [3 /*break*/, 5];
            case 4:
                e_1 = _e.sent();
                res.status(400).send({
                    message: 'Something went wrong',
                    errors: errorFormatter(e_1.message)
                });
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 9];
            case 6:
                _e.trys.push([6, 8, , 9]);
                return [4 /*yield*/, User.findOneAndUpdate({ _id: req.body.user._id }, { $set: data }, {
                        new: true,
                        context: 'query',
                        setDefaultsOnInsert: true
                    })];
            case 7:
                doc = _e.sent();
                res.status(200).send({
                    message: 'Updated User',
                    data: prepareUser(doc)
                });
                return [3 /*break*/, 9];
            case 8:
                e_2 = _e.sent();
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
    })
        .catch(function (err) {
        res.status(500).send({
            message: 'Upload failed',
            errors: err
        });
    });
});
/**
 * @api {post} /sendmail sends mail containing a link to reset password
 * @apiName SendMail
 *
 * @apiDescription Pass mail in request body.
 * The configured mail client sends a mail to the users mailing address that includes a link, to reset the user's password.
 *
 * @apiParam {String} mail User's mailing address
 * @apiParam {String} BASE_URL the Location object's URL's origin
 * @apiParam {String} RESET_URL Addition of the required route to BASE_URL
 * @apiParam {String} token random token to authenticate the user
 * @apiParam {Date} expirationDate timestamp when the reset link expires
 *
 * @apiSuccess {String} message Notification that the mail has been sent successfully.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       message: 'Mail has been sent. Check your inbox.'
 *     }
 *
 * @apiError InvalidInput Method fails if user transmits an invalid mailing address.
 * @apiError MailingError Mail could not be sent because of issues of mailing provider (smtp.web.de).
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message: 'Could not send mail!',
 *       "errors": 'No account with that email address exists.'
 *     }
 */
app.post('/sendmail', function (req, res) {
    var email = req.body.user.email;
    token = crypto.randomBytes(20).toString('hex');
    expirationDate = new Date().setHours(new Date().getHours() + 1);
    var BASE_URL = req.body.user.BASE_URL;
    var RESET_URL = BASE_URL + '/auth/forgot-pw/' + token;
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
                    return [3 /*break*/, 5];
                case 1:
                    if (!user) return [3 /*break*/, 4];
                    return [4 /*yield*/, User.findOneAndUpdate({ email: user.email }, {
                            resetPasswordToken: token,
                            resetPasswordExpires: expirationDate
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, send()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    res.status(400).send({
                        message: 'No account with that email address exists.'
                    });
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function send() {
        var html = '<p>Hey there! \n </p> ' +
            '<a href=' + RESET_URL + '><p>Click here to reset your password.</a> \n This email was sent to ' +
            email +
            '. ' +
            '\n If you do not want to change your password, just ignore this email.</p>';
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
        transporter.sendMail(mailOptions, function (err) {
            if (err) {
                res.status(400).send({
                    message: 'Could not send mail!',
                    errors: err.toString()
                });
            }
            else {
                res.status(201).send({
                    message: 'Mail has been sent. Check your inbox.'
                });
            }
        });
    }
});
/**
 * @api {get} /forgot-pw returns the token and the date of expiration
 * @apiName ForgotPassword
 *
 * @apiDescription when entering the password reset site, the token and the expiration date are sent to the client,
 * to authenticate the user
 *
 * @apiParam {String} token random token to authenticate the user
 * @apiParam {Date} expirationDate timestamp when the reset link expires
 *
 * @apiSuccess {String} message Success Message if user is still logged in.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "token": token
 *       "exp": expirationDate
 *     }
 *
 * @apiError TokenError Token is invalid or has expired.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message: 'Password reset token is invalid or has expired.'
 *     }
 */
app.get('/forgot-pw', function (req, res) {
    User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    })
        .select('+password')
        .exec(function (err, user) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            if (!user) {
                res.status(400).send({
                    message: 'Password reset token is invalid or has expired.'
                });
            }
            else {
                res.status(201).send({
                    token: token,
                    exp: expirationDate
                });
            }
            return [2 /*return*/];
        });
    }); });
});
/**
 * @api {post} /forgot-pw/:token route to reset the users password
 * @apiName ForgotPassword
 *
 * @apiDescription checks if token is valid and not expired yet.
 *
 * @apiParam {String} token random token to authenticate the user
 * @apiParam {String} password user's new password, that is immediately encrypted
 *
 * @apiSuccess {String} message Success Message if user is still logged in.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "message": 'New password has been set.'
 *     }
 *
 * @apiError MailError Email is invalid.
 * @apiError TokenError Token is invalid or has expired.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message: 'Password reset token is invalid or has expired.'
 *     }
 */
app.post('/forgot-pw/:token', function (req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    })
        .select('+password')
        .exec(function (err, user) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!err) return [3 /*break*/, 1];
                    res.status(400).send({
                        message: 'Password reset token is invalid or has expired.'
                    });
                    return [3 /*break*/, 4];
                case 1:
                    if (!user) return [3 /*break*/, 3];
                    return [4 /*yield*/, User.findOneAndUpdate({ resetPasswordToken: req.params.token }, {
                            password: bcrypt.hashSync(req.body.user.password, SALT_WORK_FACTOR),
                            resetPasswordExpires: null,
                            resetPasswordToken: null
                        })];
                case 2:
                    _a.sent();
                    token = undefined;
                    expirationDate = undefined;
                    res.status(201).send({
                        message: 'New password has been set.'
                    });
                    return [3 /*break*/, 4];
                case 3:
                    res.status(400).send({
                        message: 'No account with that email address exists.'
                    });
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
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
//# sourceMappingURL=server.js.map