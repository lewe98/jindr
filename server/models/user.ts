export {};
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const mongooseUniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const resumeSchema = mongoose.Schema({
    startDate: {type: Date },
    endDate: {type: Date },
    title: {type: String },
    description: {type: String },
    industrysector: {type: String },
    employmentType: {type: String },
})

const userSchema = mongoose.Schema({
    firstName: {type: String, required: [true, 'First Name is required.'], trim: true},
    lastName: {type: String, required: [true, 'Last Name is required.'], trim: true},
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
    },
    deviceID: {
        type: String
    },
    distance: {
        type: Number,
        default: 10
    },
    image: {
        type: String,
        default: './assets/images/avatar.jpg'
    },
    allowNotifications: {
        type: Boolean,
        default: true
    },
    aboutMe: {
        type: String,
        trim: true
    },
    dateofbirth: {
        type: Date,
        trim: true
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    resume: {
        type: [resumeSchema],
        default: []
    }
});

userSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    next();
});

userSchema.pre('save', function(next) {
    let user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.validatePassword = async function validatePassword(data) {
    return bcrypt.compare(data, this.password);
};


userSchema.plugin(mongooseUniqueValidator, {message: 'Email already in use.'});
module.exports = mongoose.model('User', userSchema, 'users');
