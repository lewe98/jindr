require('dotenv').config();
import { Request, Response } from 'express';

const express = require('express');
const mongoose = require('mongoose');
const history = require('connect-history-api-fallback');
const bodyParser = require('body-parser');
const compression = require('compression');
const sslRedirect = require('heroku-ssl-redirect');
const cors = require('cors');

const User = require('./models/user');

const MONGODB_URI: string = process.env.MONGODB_URI;
const MONGODB_NAME = process.env.MONGODB_NAME;
const ORIGIN_URL = process.env.ORIGIN_URL;
// eslint-disable-next-line
let db;

const app = express();
app.use(sslRedirect());
app.use(compression());
app.use(history());
app.use(express.static(__dirname + '/../client/www'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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
      dbName: MONGODB_NAME
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
 * POST Route to register a new User
 * Pass user in request body with all required fields
 * Method runs Mongoose Validators and writes User to Database
 * @return 201: Successfully created user
 * @return 400: Validation went wrong
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
 * POST Route for log in
 * Pass email and password
 * compares stored password and entered password as hash
 * @return 200 User Object
 * @return 400 wrong password or user not found
 */
app.post('/login', (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  User.findOne({ email: email })
    .select('+password')
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({
          message: 'Error: ' + err
        });
      } else {
        if (await user.validatePassword(password)) {
          user = user.toObject();
          delete user.password;
          res.status(200).send({
            message: 'Successfully logged in',
            data: user
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
 * Exports for testing
 * add every method like this: {app: app, method1: method1, method2: method2}
 * routes don't need to be added
 *
 */
module.exports = { app: app };
