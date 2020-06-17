import { Coords, Tile } from './models/tile';
import { Request, Response } from 'express';

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const bcrypt = require('bcrypt');
const sslRedirect = require('heroku-ssl-redirect');
const history = require('connect-history-api-fallback');
const fs = require('fs');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const _ = require('lodash');
const admin = require('firebase-admin');
const serviceAccount = require('./config/jindr-firebase-push.json');
const nodemailerConfig = require('./config/nodemailerConfig');

const User = require('./models/user');
const Job = require('./models/job');
const JobStack = require('./models/jobStack');

const MONGODB_URI: string = process.env.MONGODB_URI;
const MONGODB_NAME = process.env.MONGODB_NAME;
const ORIGIN_URL = process.env.ORIGIN_URL;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
});
const s3 = new AWS.S3();
// eslint-disable-next-line
let db;
let transporter;

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
 * VARIABLES
 */
let germanTiles: Tile[] = [];
const southWest = { lat: 47.344777, lng: 5.888672 }; // coordinates for southWestern point of a rectangle containing germany
const northEast = { lat: 54.41893, lng: 14.888671 }; // coordinates for northEastern point of a rectangle containing germany
const SALT_WORK_FACTOR = 10;
const maxRadius = 50; // Max search radius users can set in the app
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
      rasterizeMap(maxRadius, southWest, northEast);
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
  transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: nodemailerConfig.credentials.user,
      pass: nodemailerConfig.credentials.pass
    }
  });
  transporter.verify((error) => {
    if (error) {
      // eslint-disable-next-line
      console.log(error);
    } else {
      // eslint-disable-next-line
      console.log('Server is ready to take our messages');
    }
  });
  // initialize push notifications
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
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
 * @api {post} /register Starts registration of a new user
 * @apiName RegisterUser
 * @apiGroup User
 *
 * @apiDescription Pass user in request body with all required fields
 * Method runs Mongoose Validators and checks if users email is already stored in database
 *
 * @apiParam {String} user An object with firstName, lastName, email and password
 *
 message SuccessMessage if mail has been sent successfully
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 Ok
 *     {
 *       "message": "Mail has been sent. Check your inbox.",
 *     }
 *
 * @apiError ErrorMessage if mail failed to sent
 * @apiError ErrorMessage if email provided by user already exists
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message: "Could not send mail!"
 *     }
 */
app.post('/register', (req: Request, res: Response) => {
  let user = new User();
  user = Object.assign(user, req.body.user);

  const token = crypto.randomBytes(20).toString('hex');
  const expirationDate = new Date().setHours(new Date().getHours() + 24);

  const REGISTER_URL: string = req.body.BASE_URL + '/auth/register/' + token;
  const subject = 'jindr - Register now!';
  const html =
    '<p>Hey there! \n </p><a href=' +
    REGISTER_URL +
    '>Click here to register!</a><p>This link expires in 24 hours. This email was sent to ' +
    user.email +
    '. If you do not want to register, just ignore this email.</p>';

  user.save(async (err) => {
    if (err) {
      res.status(400).send({
        message: 'Something went wrong',
        errors: err.message
      });
    } else {
      await User.findOneAndUpdate(
        { email: user.email },
        {
          token: token,
          tokenExpires: expirationDate
        }
      );

      try {
        await sendMail(user.email, html, subject);
        res.status(201).send({
          message: 'Mail has been sent. Check your inbox.'
        });
      } catch (e) {
        res.status(500).send({
          message: 'Could not send mail.',
          errors: e
        });
      }
    }
  });
});

/**
 * @api {get} /register/:token Verifies the registration of a new user
 * @apiName RegisterUser
 * @apiGroup User
 *
 * @apiDescription Validates stored user object
 * Method runs Mongoose Validators and sets verification status to true
 *
 * @apiSuccess {String} message SuccessMessage if registration was verified successfully
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Successfully registered.",
 *     }
 *
 * @apiError ErrorMessage if registration link is invalid or has expired
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Bad Request
 *     {
 *       "message: "Registration link is invalid or has expired."
 *     }
 */
app.get('/register/:token', (req: Request, res: Response) => {
  User.findOne({
    token: req.params.token,
    tokenExpires: { $gt: Date.now() }
  }).exec(async (err) => {
    if (err) {
      res.status(500).send({
        message: 'Registration link is invalid or has expired.'
      });
    } else {
      await User.findOneAndUpdate(
        { token: req.params.token },
        {
          isVerified: true,
          token: null,
          tokenExpires: null
        }
      );
      res.status(201).send({
        message: 'Successfully registered.'
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
 * return the User. Checks if user is verified.
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
  User.findOne({ email: email, isVerified: true })
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
            message: 'Wrong password or registration incomplete.'
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
            data: prepareUser(user)
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
        doc = await User.findOneAndUpdate(
          { _id: req.body.user._id },
          { $set: data },
          {
            new: true,
            context: 'query',
            setDefaultsOnInsert: true
          }
        );
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
/* istanbul ignore next */
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
  const token = crypto.randomBytes(20).toString('hex');
  const expirationDate = new Date().setHours(new Date().getHours() + 1);
  const BASE_URL: string = req.body.user.BASE_URL;
  const RESET_URL: string = BASE_URL + '/auth/forgot-pw/' + token;
  const subject = 'jindr - Reset password';
  const html =
    '<p>Hey there! \n </p><a href=' +
    RESET_URL +
    '>Click here to reset your password.</a><p>This email was sent to ' +
    email +
    '. If you do not want to change your password, just ignore this email.</p>';

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
              token: token,
              tokenExpires: expirationDate
            }
          );
          try {
            await sendMail(email, html, subject);
            res.status(201).send({
              message: 'Mail has been sent. Check your inbox.'
            });
          } catch (e) {
            res.status(500).send({
              message: 'Could not send mail.'
            });
          }
        } else {
          res.status(400).send({
            message: 'No account with that email address exists.'
          });
        }
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
    token: req.params.token,
    tokenExpires: { $gt: Date.now() }
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
            { token: req.params.token },
            {
              password: bcrypt.hashSync(
                req.body.user.password,
                SALT_WORK_FACTOR
              ),
              tokenExpires: null,
              token: null
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
 * @api {put} /update-backlog updates jobs in the backlog
 * @apiName UpdateBacklog
 * @apiGroup Job
 *
 * @apiDescription pass a user and his current coordinates, and it will update the backlog and stacks
 * based on his new position and interests
 *
 * @apiParam {String} user the requesting user
 * @apiParam {String} coords current coordinates
 *
 * @apiSuccess {String} message a success message
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": 'Backlog updated'
 *     }
 */
app.put('/update-backlog', async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: req.body.user._id });
  const coords = req.body.coords;
  const jobStack = await JobStack.findOne({ userID: user._id });
  jobStack.backLog = await getAllMatchingJobs(coords, jobStack, user);
  if (jobStack.clientStack.length >= 10) {
    jobStack.serverStack =
      jobStack.backLog.length >= 10
        ? jobStack.backLog.splice(0, 10)
        : jobStack.backLog.splice(0, jobStack.backLog.length);
    jobStack.clientStack.splice(10, jobStack.clientStack.length);
    jobStack.markModified('clientStack');
    jobStack.markModified('serverStack');
  }
  jobStack.markModified('backlog');
  await jobStack.save();
  res.status(200).send({
    message: 'Backlog updated'
  });
});

/**
 * @api {put} /decision updates jobs in the backlog
 * @apiName MakeDecision
 * @apiGroup Job
 *
 * @apiDescription pass a user and his current coordinates, an job and the decision (liked or not)
 * and it will update all required documents and refill the stack and return a new job (if there is any)
 *
 * @apiParam {String} user the requesting user
 * @apiParam {String} coords current coordinates
 * @apiParam {Boolean} isLike if he liked the job or not
 * @apiParam {Number} stackLength the amount of jobs he currently has in the app
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": Job
 *     }
 */
app.put('/decision', async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: req.body.user._id });
  const jobID = req.body.jobID;
  const coords = req.body.coords;
  const isLike = req.body.isLike;
  const stackLength = req.body.stackLength;
  let jobStack = await JobStack.findOne({ userID: user._id });
  _.remove(jobStack.clientStack, (job) => {
    return job.toString() === jobID.toString();
  });
  jobStack.swipedJobs.push(jobID);
  if (isLike) {
    jobStack.likedJobs.push(jobID);
    jobStack.markModified('likedJobs');
    const likedJob = await Job.findOneAndUpdate(
      { _id: jobID },
      { $push: { interestedUsers: user._id } },
      { new: true }
    );
    const message =
      'Someone is interested in your Job ' +
      likedJob.title +
      '. Check out now!';
    // TODO add link once page exists
    sendPushNotification([likedJob.creator], 'Help offered!', message, '');
  }
  jobStack.markModified('swipedJobs');
  jobStack.markModified('clientStack');
  await jobStack.save();
  jobStack = await fillStack(jobStack, user, coords);
  let jobs = [];
  if (jobStack.clientStack.length > stackLength) {
    const ids = [];
    ids.push(jobStack.clientStack[stackLength]);
    jobs = await getJobArray(ids);
  }
  res.status(200).send({
    data: jobs
  });
});

/**
 * @api {put} /job-stack fills the job stack with jobs
 * @apiName JobStack
 * @apiGroup Job
 *
 * @apiDescription pass a user and his current coordinates, and it will create a jobStack if none exists,
 * or check if jobStack is filled and fill it if necessary and then returns the clientStack
 *
 * @apiParam {String} user the requesting user
 * @apiParam {String} coords current coordinates
 *
 * @apiSuccess {String} message a success message
 * @apiSuccess {String} data  an array of jobs
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": 'Successfully requested jobs'
 *       "data": clientStack,
 *     }
 */
app.put('/job-stack', async (req: Request, res: Response) => {
  const user = req.body.user;
  const coords = req.body.coords;
  let jobStack = await JobStack.findOne({ userID: user._id });
  if (!jobStack) {
    jobStack = new JobStack({ userID: user._id });
    await jobStack.save();
  }
  jobStack = await fillStack(jobStack, user, coords);
  // since findMany does not preserve order, we need to look them up one by one
  let jobIDs;
  let jobs = [];
  jobIDs =
    jobStack.clientStack.length > 3
      ? jobStack.clientStack.splice(0, 3)
      : jobStack.clientStack.splice(0, jobStack.clientStack.length);
  if (jobIDs.length > 0) {
    for (const id of jobIDs) {
      // TODO check if return length is null and if so, add another id to jobIDs (in case of deleted job)
      jobs = [...jobs, ...(await getJobArray(id))];
    }
  }
  res.status(200).send({
    message: 'Successfully requested jobs',
    data: jobs
  });
});

/**
 * @api {post} /create-job creates a new job
 * @apiName CreateJob
 * @apiGroup Job
 *
 * @apiDescription Pass a job and coordinates of its location, the route will specify in
 * which tile of the map the job is located and save its index
 *
 * @apiParam {String} job an object with the job
 * @apiParam {String} coords and object with coords like this: {lat: xx.xxxx, lng: xx.xxxx}
 *
 * @apiSuccess {String} message  SuccessMessage job is created
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Successfully created job",
 *     }
 *
 * @apiError JobNotCreated if job is located outside of supported area or database request failed
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message: "Your country is currently not supported."
 *     }
 */
app.post('/create-job', (req: Request, res: Response) => {
  const job = new Job();
  Object.assign(job, req.body.job);
  const tile = findTile(germanTiles, job.location);
  if (!tile) {
    res.status(400).send({
      message: 'Your country is currently not supported.'
    });
    return;
  }
  job.tile = tile;
  job.save((err, obj) => {
    if (err) {
      res.status(400).send({
        message: 'Something went wrong',
        errors: errorFormatter(err.message)
      });
    } else {
      res.status(201).send({
        message: 'Successfully created job',
        data: obj
      });
    }
  });
});

/**
 * sends all interests of the interests.json to the client
 */
app.get('/interests', (req: Request, res: Response) => {
  const rawdata = fs.readFileSync('./assets/interests.json');
  const interests = JSON.parse(rawdata);

  res.status(200).send({
    message: 'Successfully logged in',
    data: interests
  });
});

/**
 * @api {get} /get-job-by-id Gets a Job by its _id
 * @apiName GetJobById
 * @apiGroup Job
 *
 * @apiDescription If a user gets a DetailView of a job this Method will be called
 *
 * @apiParam {String} job._id is a unique ID of a Job
 *
 * @apiSuccess {Job} message  Job with _id = XXXX found!
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Job with _id = XXXX found!",
 *       "data": job
 *     }
 */
app.get('/get-job-by-id/:_id', async (req: Request, res: Response) => {
  try {
    const _id: string = req.params._id;
    let job = await Job.findOne({ _id });
    if (job) {
      res.status(200).send({
        message: 'Job with _id = ' + _id + ' found!',
        data: job
      });
    } else {
      res.status(404).send({
        message: 'No Job found with Job._id = ' + _id
      });
    }
  } catch (err) {
    res.status(500).send({
      message: 'Error: ' + err
    });
  }
});

/**
 * @api {put} /edit-job/:id edits a job
 * @apiName EditJob
 * @apiGroup Job
 *
 * @apiDescription Pass a job to update certain values
 *
 * @apiParam {Job} job an object with the job
 * @apiParam {ID} ID of a job passed in the url
 *
 * @apiSuccess {String} message SuccessMessage job is updated
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 Created
 *     {
 *       "message": "Successfully updated job."
 *     }
 *
 * @apiError JobNotCreated if job is located outside of supported area or database request failed
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message: "Your country is currently not supported."
 *     }
 *
 * @apiError JobNotUpdated if job could not be found or database request failed
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Bad Request
 *     {
 *       "message: "Job could not be found."
 *     }
 */
app.put('/edit-job/:id', (req: Request, res: Response) => {
  let job = new Job();
  Object.assign(job, req.body.job);

  const tile = findTile(germanTiles, job.location);

  if (!tile) {
    res.status(400).send({
      message: 'Your country is currently not supported.'
    });
    return;
  }

  job.tile = tile;

  // if (mongoose.Types.ObjectId.isValid(job._id)) {}
  Job.findOne({ _id: req.params.id }).exec(async (err) => {
    if (err) {
      res.status(404).send({
        message: 'Job could not be found.'
      });
    } else {
      await Job.findOneAndUpdate(
        { _id: job._id },
        {
          title: job.title,
          description: job.description,
          date: job.date,
          time: job.time,
          tile: job.tile,
          location: job.location,
          isFinished: job.isFinished,
          payment: job.payment
        }
      );
      res.status(200).send({
        message: 'Successfully updated job.'
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
  delete user.token;
  delete user.tokenExpires;
  return user;
}

/**
 * Method to send push notifications to users.
 * @param userIDs an array of users to send the notification to
 * @param title the title of the notification
 * @param message the message of the notification
 * @param link the link of the page to open when tapped on the notification
 */
async function sendPushNotification(
  userIDs: string[],
  title: string,
  message: string,
  link: string
) {
  const notificationOptions = {
    priority: 'high',
    timeToLive: 60 * 60 * 24
  };
  const payload = {
    notification: {
      title,
      message,
      link
    }
  };
  const users = await User.find().where('_id').in(userIDs).exec();
  if (users) {
    users.forEach((user) => {
      admin
        .messaging()
        .sendToDevice(user.notificationToken, payload, notificationOptions);
    });
  }
}

/**
 * Method to upload a file to the AWS S3 Bucket
 * @param file the file as base64 string
 * @param name the image name in the bucket. Should be UNIQUE! e.g. use Timestamp
 */
/* istanbul ignore next */
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
 * Method to send a verification mail to user's email address
 * @param userMail user's email address
 * @param template displayed content of the mail
 * @param subject subject of the mail
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function sendMail(userMail: string, template: string, subject: string) {
  const mailOptions = {
    from: '"Jindr Support" <noreply.jindr@gmail.com>',
    to: userMail,
    subject: subject,
    html: template
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      error ? reject(error) : resolve(info);
    });
  });
}

/**
 * Method to fill the different stacks of the jobStack. If there are 5 or less jobs in client stack,
 * the server Stack will be moved to the clientStack and refilled with jobs from the backlog. Then the
 * backlog will be filled with new jobs
 * @param jobStack the jobStack of the user
 * @param user the requesting user
 * @param coords coordinates of the users current position
 */
async function fillStack(jobStack, user, coords) {
  if (jobStack.clientStack.length <= 5) {
    if (jobStack.serverStack.length > 0) {
      jobStack.clientStack = [...jobStack.clientStack, ...jobStack.serverStack];
      jobStack.serverStack = [];
      const tileIdx = findTile(germanTiles, coords);
      if (jobStack.backLog.length > 0 && tileIdx === jobStack.tileID) {
        /*
          If there are still items in the backlog and user is still in same tile,
          shuffle the backlog and get up to 10 new jobs into serverStack
         */
        jobStack.backLog = _.shuffle(jobStack.backLog);
        jobStack.serverStack =
          jobStack.backLog.length >= 10
            ? jobStack.backLog.splice(0, 10)
            : jobStack.backLog.splice(0, jobStack.backLog.length);
        jobStack.markModified('clientStack');
        jobStack.markModified('serverStack');
        jobStack.markModified('backlog');
        await jobStack.save();
      } else {
        jobStack.tileID = tileIdx;
        /*
          If there are no more items in the backlog or user has moved tiles, populate the backlog
          with new items and move 10 into serverStack
         */
        populateBacklog(jobStack, false, coords, user);
      }
      return jobStack;
    } else {
      jobStack.tileID = findTile(germanTiles, coords);
      /*
      If there are no items in serverStack and no items in the backlog, populate the backlog,
      move 10 items in serverStack and 10 into clientStack
       */
      return await populateBacklog(jobStack, true, coords, user);
    }
  } else {
    return jobStack;
  }
}

/**
 * Method to populate the backlog and/or refill the clientStack
 * @param jobStack the users jobstack
 * @param syncClient boolean if the clientStack needs to be filled
 * @param coords coordinates of the user
 * @param user the requesting user
 */
async function populateBacklog(
  jobStack,
  syncClient,
  coords,
  user
): Promise<any> {
  if (!syncClient) {
    /*
      ClientStack does not need to be refilled, jobs will be moved from backlog to serverstack and backlog will
      be refilled. This will happen synchronously, so the user does not have to wait
     */
    jobStack.backLog = await getAllMatchingJobs(coords, jobStack, user);
    jobStack.serverStack =
      jobStack.backLog.length >= 10
        ? jobStack.backLog.splice(0, 10)
        : jobStack.backLog.splice(0, jobStack.backLog.length);
    jobStack.markModified('clientStack');
    jobStack.markModified('serverStack');
    jobStack.markModified('backlog');
    jobStack.save();
  } else if (syncClient) {
    /**
     * ClientStack needs to be refilled, backlog will be refilled first. This will happen
     * asynchronously, so the user will have to wait
     */
    jobStack.backLog = await getAllMatchingJobs(coords, jobStack, user);
    const clientTemp =
      jobStack.backLog.length >= 10
        ? jobStack.backLog.splice(0, 10)
        : jobStack.backLog.splice(0, jobStack.backLog.length);
    jobStack.clientStack = [...jobStack.clientStack, ...clientTemp];
    jobStack.serverStack =
      jobStack.backLog.length >= 10
        ? jobStack.backLog.splice(0, 10)
        : jobStack.backLog.splice(0, jobStack.backLog.length);
    jobStack.markModified('clientStack');
    jobStack.markModified('serverStack');
    jobStack.markModified('backlog');
    await jobStack.save();
    return jobStack;
  }
}

/**
 * Method to find all jobs that match certain criteria
 * Querying all jobs from the database, that are in the selected tiles, have not already been swiped and are not yet finished
 * Then checks if jobs are already in serverStack or clientStack and checks if jobs are in specified radius
 * @param coords current Coordinates of the user
 * @param jobStack the jobStack of the user
 * @param user the requesting user
 */
async function getAllMatchingJobs(coords, jobStack, user): Promise<any[]> {
  const tile = findTile(germanTiles, coords);
  if (tile === null) {
    return [];
  }
  // get all neighboring tiles and prepend current tile
  const neighbors = germanTiles[tile].neighbours;
  neighbors.unshift(tile);
  // .lean() https://www.tothenew.com/blog/high-performance-find-query-using-lean-in-mongoose-2/
  const allJobs = await Job.find()
    .where('tile')
    .in(neighbors)
    .where('_id')
    .nin(jobStack.swipedJobs)
    .where('isFinished')
    .equals(false)
    .lean()
    .exec();

  const foundJobs = [];
  allJobs.forEach((job) => {
    const dist = getDistanceFromLatLonInKm(
      coords.lat,
      coords.lng,
      job.location.lat,
      job.location.lng
    );
    // check for distance and if already present in server or client Stack
    // check if in lists first, because its cheaper than checking distance
    if (
      !jobStack.clientStack.some((x) => x.toString() === job._id.toString()) &&
      !jobStack.serverStack.some((x) => x.toString() === job._id.toString()) &&
      dist <= user.distance
    ) {
      if (user.interest.length === 0) {
        foundJobs.push(job._id);
      } else {
        const commonInterests = _.intersectionWith(
          job.interest,
          user.interest,
          _.isEqual
        );
        if (commonInterests.length > 0) {
          foundJobs.push(job._id);
        }
      }
    }
  });
  return foundJobs;
}

/**
 * Method to find the tile of the map, the user is currently in
 * @param tiles an array of all tiles
 * @param coords the users current coordinates
 * @return returns the index of the tile, returns null if user is not in rasterized area
 */
function findTile(tiles: Tile[], coords: Coords): number {
  if (!coords) {
    return null;
  }
  let index = null;
  tiles.forEach((tile) => {
    if (coords.lat >= tile.southWest.lat && coords.lat <= tile.northEast.lat) {
      if (
        coords.lng >= tile.southWest.lng &&
        coords.lng <= tile.northEast.lng
      ) {
        index = tile.index;
        return;
      }
    }
  });
  return index;
}

/**
 * Method to get jobs from the database from an array of jobIDs
 * @param jobStack an array of job IDs
 */
async function getJobArray(jobStack) {
  return await Job.find()
    .where('_id')
    .in(jobStack)
    .where('isFinished')
    .equals(false)
    .exec();
}
/**
 * Method to rasterize the the map into equal rectangles
 * @param radius the approx. size of each tile. This value should equal the maximum search radius specified in the client
 * @param southWest coordinates of the southWestern point of the area to rasterize
 * @param northEast coordinates of the northEastern point of the area to rasterize
 * @return an array of Tiles
 * southWest and northEast are coordinates of points that build a rectangle around the required area (for now only germany)
 * The rectangle must contain all areas of germany, so by the shape of germany, they will lay outside
 * longitudeDistance is the distance in KM between longitudes. Germany is at around 50 degree and thus the distance is around 71KM
 * xTiles and yTiles is the calculated number of equal tiles on x and y axis the area can be divided in by the specified radius
 * tileWidth and tileHeight is the actual size of each tile. This will be roughly the radius.
 * The function then rasterize the specified area, starting at the southWest coordinates and create a Tile for each rectangle
 * Each Tile has an index (southWest = 0), southWest and northEast coordinates, and an array of indexes of neighboring tiles
 */
function rasterizeMap(
  radius: number,
  southWest: Coords,
  northEast: Coords
): Tile[] {
  const longitudeDistance = 71;
  const xTiles = Math.round(
    ((northEast.lng - southWest.lng) * longitudeDistance) / radius
  );
  const yTiles = Math.round(((northEast.lat - southWest.lat) * 111) / radius);
  const array: Tile[] = [];
  const tileWidth = (northEast.lng - southWest.lng) / xTiles;
  const tileHeight = (northEast.lat - southWest.lat) / yTiles;
  let i = 0;
  for (let y = 0; y < yTiles; y++) {
    // eslint-disable-line
    for (let x = 0; x < xTiles; x++) {
      // eslint-disable-line
      const tile = new Tile();
      tile.index = i;
      tile.northEast = {
        lat: southWest.lat + tileHeight * (y + 1),
        lng: southWest.lng + tileWidth * (x + 1)
      };
      tile.southWest = {
        lat: southWest.lat + tileHeight * y,
        lng: southWest.lng + tileWidth * x
      };
      tile.neighbours = getBoundingAreas(i, xTiles, yTiles);
      array.push(tile);
      i++;
    }
  }
  germanTiles = array;
  return array;
}

/**
 * Method to return the indexes of all neighboring tiles
 * @param pos the index of the current tile
 * @param xTiles the number of tiles on the x axis
 * @param yTiles the number of tiles on the y axis
 * @return an array of indexes
 */
function getBoundingAreas(pos, xTiles, yTiles): number[] {
  const bounds = [];
  let hasLeftRow = false;
  let hasRightRow = false;
  if (pos > 0 && !(pos % xTiles === 0)) {
    hasLeftRow = true;
    bounds.push(pos - 1);
  }
  if (!((pos + 1) % xTiles === 0)) {
    hasRightRow = true;
    bounds.push(pos + 1);
  }
  if (pos - xTiles >= 0) {
    // hasBottomRow?
    bounds.push(pos - xTiles);
    if (hasLeftRow) bounds.push(pos - xTiles - 1); // eslint-disable-line
    if (hasRightRow) bounds.push(pos - xTiles + 1); // eslint-disable-line
  }
  if (pos + xTiles <= xTiles * yTiles - 1) {
    // hasTopRow?
    bounds.push(pos + xTiles);
    if (hasLeftRow) bounds.push(pos + xTiles - 1); // eslint-disable-line
    if (hasRightRow) bounds.push(pos + xTiles + 1); // eslint-disable-line
  }
  return bounds;
}

/**
 * calculates the distance between two coordinates with haversine formula
 * This Calculation is not perfectly accurate, but enough for this use case
 * @param lat1 origin latitude
 * @param lon1 origin longitude
 * @param lat2 destiantion latitue
 * @param lon2 destination longitude
 * @return calculated distance
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * This is only for testing purposes
 */
app.get('/jobstack/:userID', async (req: Request, res: Response) => {
  const userID = req.params.userID;
  try {
    const stack = await JobStack.findOne({ userID: userID }).exec();
    res.status(200).send({
      data: stack
    });
  } catch (e) {
    res.status(500).send({
      errors: e
    });
  }
});
/**
 * Method to set nodemailer transporter, only used for testing purposes
 * @param transp transporter
 */
function setTransporter(transp) {
  transporter = transp;
}
/**
 * Exports for testing
 * add every method like this: {app: app, method1: method1, method2: method2}
 * routes don't need to be added
 *
 */
module.exports = {
  app: app,
  prepareUser: prepareUser,
  rasterizeMap: rasterizeMap,
  getDistanceFromLatLonInKm: getDistanceFromLatLonInKm,
  getBoundingAreas: getBoundingAreas,
  findTile: findTile,
  setTransporter: setTransporter
};
