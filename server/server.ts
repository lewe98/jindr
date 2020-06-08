require('dotenv').config();
import { Request, Response } from 'express';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const bcrypt = require('bcrypt');
const sslRedirect = require('heroku-ssl-redirect');
const history = require('connect-history-api-fallback');
const SALT_WORK_FACTOR = 10;
const fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const User = require('./models/user');
let token: string;
let expirationDate: number;

const MONGODB_URI: string = process.env.MONGODB_URI;
const MONGODB_NAME = process.env.MONGODB_NAME;
const ORIGIN_URL = process.env.ORIGIN_URL;
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY
});
// eslint-disable-next-line
let db;

const app = express();
app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(sslRedirect(['staging', 'production']));
app.use(history());
app.use(express.static(__dirname + '/../client/www'));
app.use(
  cors({
    credentials: true,
    origin: ORIGIN_URL
  })
);

/**
 * Only starts server if Environment is not test,
 * This is required for Jest Memory Database Tests
 */
app.set('port', process.env.PORT);
/* istanbul ignore next */
if (process.env.NODE_ENV.trim() !== 'test') {
  app.listen(app.get('port'), () => {
    (async () => {
      // eslint-disable-next-line
      console.log('Server connected at: ' + app.get('port'));
      await dbConnect();
    })();
  });
}

/* istanbul ignore next */
async function dbConnect() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      dbName: MONGODB_NAME,
      useFindAndModify: false
    });
    db = mongoose.connection;
    // eslint-disable-next-line
    console.log('Database is connected ...\n');
  } catch (err) {
    // eslint-disable-next-line
    console.error('Error connecting to database ...\n' + err);
  }
}

/**
 * Method to transform Mongoose Error string into an Object
 * @param e Errors as string
 * @return Object of errors
 * Example: e: 'Validation errors: email: Email is required, password: Password is required
 * returns {email: 'Email is required', password: 'Password is required'}
 */
const errorFormatter = (e) => {
  const errors = {};
  const all = e.substring(e.indexOf(':') + 1).trim();
  const allAsArray = all.split(',').map((err) => err.trim());
  allAsArray.forEach((error) => {
    const [key, value] = error.split(':').map((err) => err.trim());
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
app.post('/register', (req: Request, res: Response) => {
  let user = new User();
  user = Object.assign(user, req.body.user);
  user.save((err) => {
    if (err) {
      res.status(400).send({
        message: 'Something went wrong',
        errors: errorFormatter(err.message)
      });
    } else {
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
app.post('/login', (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const deviceID: string = req.body.deviceID;
  const opts = { new: true };
  User.findOne({ email: email })
    .select('+password')
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({
          message: 'Error: ' + err
        });
      } else {
        if (user && (await user.validatePassword(password))) {
          user = await User.findOneAndUpdate(
            { email: user.email },
            { deviceID: deviceID },
            opts
          );
          res.status(200).send({
            message: 'Successfully logged in',
            data: prepareUser(user)
          });
        } else {
          res.status(400).send({
            message: 'Wrong password'
          });
        }
      }
    });
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
app.get('/login/:deviceID', async (req: Request, res: Response) => {
  User.findOne({ deviceID: req.params.deviceID })
    .select('-password')
    .exec((err, user) => {
      if (err) {
        res.status(500).send({
          message: 'Error: ' + err
        });
      } else {
        if (user) {
          res.status(200).send({
            message: 'User still logged in',
            data: user
          });
        } else {
          res.status(401).send({
            message: 'Session expired, please log in again'
          });
        }
      }
    });
});

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
app.post('/logout', async (req: Request, res: Response) => {
  if (mongoose.Types.ObjectId.isValid(req.body.userID)) {
    User.findByIdAndUpdate(
      req.body.userID,
      { $set: { deviceID: null } },
      { new: true }
    ).then(() => {
      res.status(200).send({
        message: 'Successfully logged out'
      });
    });
  }
});

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
app.put('/update-user', async (req: Request, res: Response) => {
  let doc;
  const data = {};
  // eslint-disable-next-line no-loops/no-loops
  for (const [key, value] of Object.entries(req.body.user)) {
    if (key !== '_id') {
      data[key] = value;
    }
  }
  if (mongoose.Types.ObjectId.isValid(req.body.user._id)) {
    if (req.body.password) {
      const hash = await bcrypt.hashSync(req.body.password, SALT_WORK_FACTOR);
      try {
        doc = await User.findOneAndUpdate(
          { _id: req.body.user._id },
          { password: hash },
          { new: true }
        );
        res.status(200).send({
          message: 'Password changed',
          data: prepareUser(doc)
        });
      } catch (e) {
        res.status(400).send({
          message: 'Something went wrong',
          errors: errorFormatter(e.message)
        });
      }
    } else {
      try {
        doc = await User.findOneAndUpdate({ _id: req.body.user._id }, data, {
          new: true,
          context: 'query'
        });
        res.status(200).send({
          message: 'Updated User',
          data: prepareUser(doc)
        });
      } catch (e) {
        res.status(400).send({
          message: 'Something went wrong',
          errors: errorFormatter(e.message)
        });
      }
    }
  }
});

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
app.get('/user/:userID', (req: Request, res: Response) => {
  User.findOne({ _id: req.params.userID })
    .select('-password -deviceID')
    .exec((err, user) => {
      if (err) {
        res.status(404).send({
          message: 'User not found',
          errors: err
        });
      } else {
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
app.post('/upload-image', (req: Request, res: Response) => {
  const name = req.body.name;
  const file = req.body.file;
  uploadFile(file, name)
    .then((result) => {
      res.status(201).send({
        message: 'Image saved',
        data: result
      });
    })
    .catch((err) => {
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
app.post('/sendmail', (req: Request, res: Response) => {
  const email: string = req.body.user.email;
  token = crypto.randomBytes(20).toString('hex');
  expirationDate = new Date().setHours(new Date().getHours() + 1);
  const BASE_URL: string = req.body.user.BASE_URL;
  const RESET_URL: string = BASE_URL + '/auth/forgot-pw/' + token;

  User.findOne({ email: email })
    .select('+password')
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({
          message: 'Error: ' + err
        });
      } else {
        if (user) {
          await User.findOneAndUpdate(
            { email: user.email },
            {
              resetPasswordToken: token,
              resetPasswordExpires: expirationDate
            }
          );
          await send();
        } else {
          res.status(400).send({
            message: 'No account with that email address exists.'
          });
        }
      }
    });

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  function send() {
    const html =
      '<p>Hey there! Click </p><a href=' +
      RESET_URL +
      '>here</a>' +
      '<p> to reset your password. \n This email was sent to ' +
      email +
      '. ' +
      '\n If you do not want to change your password, just ignore this email.</p>';

    const transporter = nodemailer.createTransport({
      host: 'smtp.web.de',
      port: 587,
      secure: false,
      auth: {
        user: 'app.jindr@web.de',
        pass: 'JindrPW1!'
      }
    });

    const mailOptions = {
      from: 'jindr Support app.jindr@web.de',
      to: email,
      subject: 'jindr - Reset password',
      html: html
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        res.status(400).send({
          message: 'Could not send mail!',
          errors: err.toString()
        });
      } else {
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
app.get('/forgot-pw', (req: Request, res: Response) => {
  User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  })
    .select('+password')
    .exec(async (err, user) => {
      if (!user) {
        res.status(400).send({
          message: 'Password reset token is invalid or has expired.'
        });
      } else {
        res.status(201).send({
          token: token,
          exp: expirationDate
        });
      }
    });
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
app.post('/forgot-pw/:token', (req: Request, res: Response) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  })
    .select('+password')
    .exec(async (err, user) => {
      if (err) {
        res.status(400).send({
          message: 'Password reset token is invalid or has expired.'
        });
      } else {
        if (user) {
          await User.findOneAndUpdate(
            { resetPasswordToken: req.params.token },
            {
              password: bcrypt.hashSync(
                req.body.user.password,
                SALT_WORK_FACTOR
              )
            }
          );
          res.status(201).send({
            message: 'New password has been set.'
          });
        } else {
          res.status(400).send({
            message: 'No account with that email address exists.'
          });
        }
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
function uploadFile(file, name): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let params;
    const base64Image = file.split(';base64,').pop();
    fs.writeFile('image.png', base64Image, { encoding: 'base64' }, () => {
      const fileContent = fs.readFileSync('image.png');
      params = {
        Bucket: 'jindr-images',
        Key: name, // File name you want to save as in S3
        Body: fileContent,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };
      s3.upload(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
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
