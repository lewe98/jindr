import {Coords, Tile} from "./models/tile";

require('dotenv').config();
import {Request, Response} from 'express';

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

const User = require('./models/user');

const MONGODB_URI: string = process.env.MONGODB_URI;
const MONGODB_NAME = process.env.MONGODB_NAME;
const ORIGIN_URL = process.env.ORIGIN_URL;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});
const s3 = new AWS.S3();
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
    rasterizeMap(50);
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
  uploadFile(file, name).then((result) => {
    res.status(201).send({
      message: 'Image saved',
      data: result
    });
  }).catch(err => {
    res.status(500).send({
      message: 'Upload failed',
      errors: err
    });
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
    fs.writeFile('image.png', base64Image, {encoding: 'base64'}, () => {
      const fileContent = fs.readFileSync('image.png');
      params = {
        Bucket: 'jindr-images',
        Key: name, // File name you want to save as in S3
        Body: fileContent,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };
      s3.upload(params,  (error, data) => {
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
 * Method to find the tile of the map, the user is currently in
 * @param tiles an array of all tiles
 * @param coords the users current coordinates
 * @return returns the index of the tile, returns null if user is not in rasterized area
 */
function findTile(tiles: Tile[], coords: Coords): number {
  tiles.forEach(tile => {
    if (coords.lat >= tile.southWest.lat && coords.lat <= tile.northEast.lat) {
      if (coords.lng >= tile.southWest.lng && coords.lng <= tile.northEast.lng) {
        return tile.index;
      }
    }
  });
  return null;
}

/**
 * Method to rasterize the the map into equal rectangles
 * @param radius the approx. size of each tile. This value should equal the maximum search radius specified in the client
 * southWest and northEast are coordinates of points that build a rectangle around the required area (for now only germany)
 * The rectangle must contain all areas of germany, so by the shape of germany, they will lay outside
 * longitudeDistance is the distance in KM between longitudes. Germany is at around 50 degree and thus the distance is around 71KM
 * xTiles and yTiles is the calculated number of equal tiles on x and y axis the area can be divided in by the specified radius
 * tileWidth and tileHeight is the actual size of each tile. This will be roughly the radius.
 * The function then rasterize the specified area, starting at the southWest coordinates and create a Tile for each rectangle
 * Each Tile has an index (southWest = 0), southWest and northEast coordinates, and an array of indexes of neighboring tiles
 * @return an array of Tiles
 */
function rasterizeMap(radius: number): Tile[] {
  const southWest = {lat: 47.344777, lng: 5.888672};
  const northEast = {lat: 54.41893, lng: 14.888671};
  const longitudeDistance = 71;
  const xTiles = Math.round(((northEast.lng - southWest.lng) * longitudeDistance) / radius);
  const yTiles = Math.round(((northEast.lat - southWest.lat) * 111) / radius);

  const tileWidth = (northEast.lng - southWest.lng) / xTiles;
  const tileHeight = (northEast.lat - southWest.lat) / yTiles;
  let arr: Tile[] = [];
  let i = 0;
  for (let y = 0; y < yTiles; y++) {
    for (let x = 0; x < xTiles; x++) {
      let tile = new Tile();
      tile.index = i;
      tile.northEast = {lat: southWest.lat + (tileHeight * (y + 1)), lng: southWest.lng + (tileWidth * (x + 1))};
      tile.southWest = {lat: southWest.lat + (tileHeight * y), lng: southWest.lng + (tileWidth * x)};
      tile.neighbours = getBoundingAreas(i, xTiles, yTiles);
      arr.push(tile);
      i++;
    }
  }
  return arr;
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
  if (pos - xTiles >= 0) { // hasTopRow?
    bounds.push(pos - xTiles);
    if (hasLeftRow) bounds.push(pos - xTiles - 1);
    if (hasRightRow) bounds.push(pos - xTiles + 1);
  }
  if (pos + xTiles <= xTiles * yTiles) { // hasBottomRow?
    bounds.push(pos + xTiles);
    if (hasLeftRow) bounds.push(pos + xTiles - 1);
    if (hasRightRow) bounds.push(pos + xTiles + 1);
  }
 return bounds;
}

/**
 * Exports for testing
 * add every method like this: {app: app, method1: method1, method2: method2}
 * routes don't need to be added
 *
 */
module.exports = { app: app, prepareUser: prepareUser };
