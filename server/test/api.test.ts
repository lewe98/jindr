
const server = require('../server.js');
const app = server.app;
const request = require('supertest');
import {describe, it, expect, beforeAll, afterAll} from 'jest-without-globals'
const dbHandler = require('./database-handler');
const User = require('../models/user');
const Job = require('../models/job');

const southWest = {lat: 47.344777, lng: 5.888672}; // coordinates for southWestern point of a rectangle containing germany
const northEast = {lat: 54.41893, lng: 14.888671}; // coordinates for northEastern point of a rectangle containing germany
const maxRadius = 50; // Max search radius users can set in the app
const EMAIL_ONE = 'jindr-test@web.de';
const EMAIL_TWO = 'jindr2-test@web.de';
const DEVICE_ID = 'iphone123pwa';
const PASSWORD_ONE = 'password1';
const PASSWORD_TWO = 'password2';
let USER_ONE = new User({firstName: 'User1_first', lastName: 'User1_last', email: EMAIL_ONE, password: PASSWORD_ONE});
let USER_TWO = new User({firstName: 'User2_first', lastName: 'User2_last', email: EMAIL_TWO, password: PASSWORD_TWO});
let LOGGED_IN_USER;
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
  await dbHandler.connect();
  server.rasterizeMap(maxRadius, southWest, northEast);
});

/**
 * Clear all test data after every test.
 */
// afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase());

async function cleanEntries() {
    USER_ONE = new User({firstName: 'User1_first', lastName: 'User1_last', email: EMAIL_ONE, password: PASSWORD_ONE});
    USER_TWO = new User({firstName: 'User2_first', lastName: 'User2_last', email: EMAIL_TWO, password: PASSWORD_TWO});
    await dbHandler.clearDatabase();
    await request(app)
        .post('/register')
        .send({
            user: USER_ONE
        });
    await request(app)
        .post('/register')
        .send({
            user: USER_TWO
        });
}

describe('Register new User', () => {
    it('should create a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                user: USER_ONE
            })
        expect(res.statusCode).toEqual(201);
    });
    it('should fail if email exists', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                user: USER_ONE
            })
        expect(res.statusCode).toEqual(400)
    });
    it('should fail if password is missing', async () => {
        const noPW = new User({ firstName: 'Test', lastName: 'Test', email: 'abc@abcd.de', password: '' });
        const res = await request(app)
            .post('/register')
            .send({
                user: noPW
            })
        expect(res.statusCode).toEqual(400)
    });
    it('should fail if email is invalid', async () => {
        const invalidMail = new User({ firstName: 'Test', lastName: 'Test', email: 'abc@abcd', password: 'Test123' });
        const res = await request(app)
            .post('/register')
            .send({
                user: invalidMail
            })
        expect(res.statusCode).toEqual(400)
    });
    it("should verify user", async () => {
        const u = await request(app)
          .get("/user/" + USER_ONE._id)
          .send();

        const res = await request(app)
          .get("/register/" + u.body.data.token)
          .send();

        const newU = await request(app)
          .get("/user/" + USER_ONE._id)
          .send();

        USER_ONE = newU.body.data;

        expect(res.statusCode).toEqual(201);
        expect(USER_ONE.isVerified).toEqual(true);
    });
});

describe('Login User', () => {
    it('should successfully log in', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: EMAIL_ONE,
                password: PASSWORD_ONE,
                deviceID: DEVICE_ID
            });
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body.data).toBe('object');
        LOGGED_IN_USER = res.body.data;
        expect(res.body.data.password).toBe(undefined);
    });
    it('should fail with wrong password', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: EMAIL_ONE,
                password: PASSWORD_TWO
            })
        expect(res.statusCode).toEqual(400);
    });
    it ('should fail if user does not exist', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: 'noemail@test.de',
                password: PASSWORD_ONE
            })
        expect(res.statusCode).toEqual(400);
    });
});

describe('Log out user', () => {
    it('should log out the user', async () => {
        const res = await request(app)
            .post('/logout')
            .send({
                userID: LOGGED_IN_USER._id
            });
        expect(res.statusCode).toEqual(200);
    });
});

describe('Check if user is still logged in', () => {
    it('should fail if deviceID does not exist', async () => {
        const res = await request(app)
            .get('/login/' + DEVICE_ID)
            .send();
        expect(res.statusCode).toEqual(401);
    });
    it('should log in', async () => {
        await request(app)
            .post('/login')
            .send({
                email: EMAIL_ONE,
                password: PASSWORD_ONE,
                deviceID: DEVICE_ID
            });
    });
    it('should succeed if deviceID exists', async () => {
        const res = await request(app)
            .get('/login/' + DEVICE_ID)
            .send();
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body.data).toBe('object');
        LOGGED_IN_USER = res.body.data;
        expect(res.body.data.password).toBe(undefined);
    });
});

describe('Test Update User',  () => {
    it('should update the user', async () => {
        USER_ONE.firstName = 'PutTest';
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE});
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.firstName).toEqual('PutTest');
        expect(res.body.data.lastName).toEqual(USER_ONE.lastName);
        expect(res.body.data.password).toBe(undefined);
    });
    it('should fail if required fields are missing', async () => {
        USER_ONE.lastName = '';
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE});
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors.lastName).toEqual('Last Name is required.')
    });
    it('should create a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                user: USER_TWO
            })
        expect(res.statusCode).toEqual(201);
    });
    it('should update if email is changed', async () => {
        USER_ONE.lastName = 'User1_last';
        USER_ONE.email = 'test@emailtest.de';
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE});
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.email).toEqual('test@emailtest.de');
        expect(res.body.data.password).toBe(undefined);
    });
    it('should fail if email is in use', async () => {
       USER_ONE.email = EMAIL_TWO;
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE});
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors.email).toEqual('Email already in use.');
    });
    it('should change password if provided', async () => {
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE, password: PASSWORD_TWO});
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Password changed');
    });
    it('should log user in with new password', async () => {
            const res = await request(app)
                .post('/login')
                .send({
                    email: 'test@emailtest.de',
                    password: PASSWORD_TWO,
                    deviceID: DEVICE_ID
                });
            expect(res.statusCode).toEqual(200);
            expect(typeof res.body.data).toBe('object');
            LOGGED_IN_USER = res.body.data;
            expect(res.body.data.password).toBe(undefined);
        await cleanEntries();
    });
});

describe('Test Get User', () => {
    it('should return user if exists', async() => {
        const res = await request(app)
            .get('/user/' + USER_ONE._id)
            .send();
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body.data).toBe('object');
        expect(res.body.data.password).toBe(undefined);
    });
    it('should fail if user does not exist', async() => {
        const res = await request(app)
            .get('/user/' + '12abc123lkj')
            .send();
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('User not found');
    });
});

describe('Send reset mail', () => {
    it('should send a mail with link to reset passsword', async () => {
        const res = await request(app)
            .post('/sendmail')
            .send({
                user: {email: EMAIL_ONE}
            })
        expect(res.statusCode).toEqual(201);
    });
    it('should fail if email is invalid', async () => {
        const res = await request(app)
            .post('/sendmail')
            .send({
                user: {email: 'John.com'}
            })
        expect(res.statusCode).toEqual(400)
    });
});

describe('Reset password', () => {
    it('should set new password', async () => {

        const u = await request(app)
          .get("/user/" + USER_ONE._id)
          .send();

        const res = await request(app)
          .post('/forgot-pw/' + u.body.data.token)
          .send({
              user: {password: 'passwort74'}
          })

        expect(res.statusCode).toEqual(201)
    });
});

describe('test create job', () => {
  it('should fail if user is outside of supported area', async () => {
    const res = await request(app)
      .post('/create-job')
      .send({
        coords: {
          lat: 49.94484531666043,
          lng: 5.048706257591307
        }
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Your country is currently not supported.');
  });
  it('should create if all required fields are filled', async () => {
    const res = await request(app)
      .post('/create-job')
      .send({
        job: {
          title: 'Test Job',
          description: 'Test Description',
          creator: LOGGED_IN_USER._id
        },
        coords: {
          lat: 51.3260435992175,
          lng: 9.72345094553722
        }
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('Successfully created job');
    expect(res.body.data.tile).toEqual(122);
  });
})
