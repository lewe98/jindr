"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mongoose = require('mongoose');
var isEmail = require('validator').isEmail;
var mongooseUniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var userSchema = mongoose.Schema({
    firstName: { type: String, required: [true, 'First Name is required.'], trim: true },
    lastName: { type: String, required: [true, 'Last Name is required.'], trim: true },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        validate: [isEmail, 'Invalid email.'],
        unique: [true, 'Email already in use.'],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        trim: true,
        minlength: [6, 'Password can\'t be shorter than 6 characters.']
    }
});
userSchema.pre('save', function (next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password'))
        return next();
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err)
            return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err)
                return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
userSchema.methods.validatePassword = function validatePassword(data) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, bcrypt.compare(data, this.password)];
        });
    });
};
userSchema.plugin(mongooseUniqueValidator, { message: 'Email already in use.' });
module.exports = mongoose.model('User', userSchema, 'users');
//# sourceMappingURL=user.js.map