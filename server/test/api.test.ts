
const server = require('../server.js');
const app = server.app;
const request = require('supertest');
import {describe, it, expect, beforeAll, afterAll} from 'jest-without-globals'
const nodemailer = require('nodemailer');
const dbHandler = require('./database-handler');
const User = require('../models/user');

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
let JOB_ONE;
let JOB_TWO;
let JOBS_TO_LIKE;
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async (done) => {
  await dbHandler.connect();
  server.rasterizeMap(maxRadius, southWest, northEast);
  const transporter = nodemailer.createTransport({
    host: "smtp.mailspons.com",
    port: 2525,
    auth: {
      user: "344777f0965d46fe8329",
      pass: "425c069dc48e4449ac3df08b80405e1a"
    },
    debug: false,
    logger: false
  });
  server.setTransporter(transporter);
  done();
});

/**
 * Clear all test data after every test.
 */
// afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async (done) => {
  await dbHandler.closeDatabase();
  done();
});

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
    it('should create a new user', async (done) => {
        const res = await request(app)
            .post('/register')
            .send({
                user: USER_ONE
            });
        expect(res.statusCode).toEqual(201);
        done();

    });
    it('should fail if email exists', async (done) => {
        const res = await request(app)
            .post('/register')
            .send({
                user: USER_ONE
            })
        expect(res.statusCode).toEqual(400);
        done();
    });
    it('should fail if password is missing', async (done) => {
        const noPW = new User({ firstName: 'Test', lastName: 'Test', email: 'abc@abcd.de', password: '' });
        const res = await request(app)
            .post('/register')
            .send({
                user: noPW
            })
        expect(res.statusCode).toEqual(400);
        done();
    });
    it('should fail if email is invalid', async (done) => {
        const invalidMail = new User({ firstName: 'Test', lastName: 'Test', email: 'abc@abcd', password: 'Test123' });
        const res = await request(app)
            .post('/register')
            .send({
                user: invalidMail
            })
        expect(res.statusCode).toEqual(400);
        done();
    });
    it("should verify user", async (done) => {
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
        done();
    });
});

describe('Login User', () => {
    it('should successfully log in', async (done) => {
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
        done();
    });
    it('should fail with wrong password', async (done) => {
        const res = await request(app)
            .post('/login')
            .send({
                email: EMAIL_ONE,
                password: PASSWORD_TWO
            })
        expect(res.statusCode).toEqual(400);
        done();
    });
    it ('should fail if user does not exist', async (done) => {
        const res = await request(app)
            .post('/login')
            .send({
                email: 'noemail@test.de',
                password: PASSWORD_ONE
            })
        expect(res.statusCode).toEqual(400);
        done();
    });
});

describe('Log out user', () => {
    it('should log out the user', async (done) => {
        const res = await request(app)
            .post('/logout')
            .send({
                userID: LOGGED_IN_USER._id
            });
        expect(res.statusCode).toEqual(200);
        done();
    });
});

describe('Check if user is still logged in', () => {
    it('should fail if deviceID does not exist', async (done) => {
        const res = await request(app)
            .get('/login/' + DEVICE_ID)
            .send();
        expect(res.statusCode).toEqual(401);
        done();
    });
    it('should log in', async (done) => {
        await request(app)
            .post('/login')
            .send({
                email: EMAIL_ONE,
                password: PASSWORD_ONE,
                deviceID: DEVICE_ID
            });
        done();
    });
    it('should succeed if deviceID exists', async (done) => {
        const res = await request(app)
            .get('/login/' + DEVICE_ID)
            .send();
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body.data).toBe('object');
        LOGGED_IN_USER = res.body.data;
        expect(res.body.data.password).toBe(undefined);
        done();
    });
});

describe('Test Update User',  () => {
    it('should update the user', async (done) => {
        USER_ONE.firstName = 'PutTest';
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE});
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.firstName).toEqual('PutTest');
        expect(res.body.data.lastName).toEqual(USER_ONE.lastName);
        expect(res.body.data.password).toBe(undefined);
        done();
    });
    it('should fail if required fields are missing', async (done) => {
        USER_ONE.lastName = '';
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE});
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors.lastName).toEqual('Last Name is required.');
      done();
    });
    it('should create a new user', async (done) => {
        const res = await request(app)
            .post('/register')
            .send({
                user: USER_TWO
            })
        expect(res.statusCode).toEqual(201);
        done();
    });
    it('should update if email is changed', async (done) => {
        USER_ONE.lastName = 'User1_last';
        USER_ONE.email = 'test@emailtest.de';
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE});
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.email).toEqual('test@emailtest.de');
        expect(res.body.data.password).toBe(undefined);
        done();
    });
    it('should fail if email is in use', async (done) => {
       USER_ONE.email = EMAIL_TWO;
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE});
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors.email).toEqual('Email already in use.');
        done();
    });
    it('should change password if provided', async (done) => {
        const res = await request(app)
            .put('/update-user')
            .send({user: USER_ONE, password: PASSWORD_TWO});
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Password changed');
        done();
    });
    it('should log user in with new password', async (done) => {
      jest.setTimeout(10000);
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
        done();
    });
});

describe('Test Get User', () => {
    it('should return user if exists', async(done) => {
        const res = await request(app)
            .get('/user/' + USER_ONE._id)
            .send();
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body.data).toBe('object');
        expect(res.body.data.password).toBe(undefined);
        done();
    });
    it('should fail if user does not exist', async(done) => {
        const res = await request(app)
            .get('/user/' + '12abc123lkj')
            .send();
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('User not found');
        done();
    });
});

describe('Send reset mail', () => {
    it('should send a mail with link to reset passsword', async (done) => {
        const res = await request(app)
            .post('/sendmail')
            .send({
                user: {email: EMAIL_ONE}
            })
        expect(res.statusCode).toEqual(201);
        done();
    });
    it('should fail if email is invalid', async (done) => {
        const res = await request(app)
            .post('/sendmail')
            .send({
                user: {email: 'John.com'}
            })
        expect(res.statusCode).toEqual(400);
        done();
    });
});

describe('Reset password', () => {
    it('should set new password', async (done) => {

        const u = await request(app)
          .get("/user/" + USER_ONE._id)
          .send();

        const res = await request(app)
          .post('/forgot-pw/' + u.body.data.token)
          .send({
              user: {password: 'passwort74'}
          })

        expect(res.statusCode).toEqual(201);
        done();
    });
});

describe('test create job', () => {
  it('should fail if user is outside of supported area', async (done) => {
    const res = await request(app)
      .post('/create-job')
      .send({
        job: {
            location: {
            lat: 49.94484531666043,
            lng: 5.048706257591307
          }
        }
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Your country is currently not supported.');
    done();
  });

  it('should create if all required fields are filled', async (done) => {
    const res = await request(app)
      .post('/create-job')
      .send({
        job: {
          title: "erster job",
          description: "test123",
          creator: "5ee24164c71c594a94003ea3",
          location: {
            lat: 51.3260435992175,
            lng: 9.72345094553722
          }
        }
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('Successfully created job');
    expect(res.body.data.tile).toEqual(122);
    done();
  });
});

describe('test clientJob stack', () => {
  it('should get all jobs in the radius, if there are less than clientStack size', async (done) => {
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/create-job')
        .send({
          job: {
            title: "erster job",
            description: "test123",
            creator: "5ee24164c71c594a94003ea3",
            location: {
              lat: 51.3260435992175,
              lng: 9.72345094553722
            }
          }
        });
    }
    const res = await request(app)
      .put('/job-stack')
      .send({
        user: USER_ONE,
        coords: {
          lat: 51.3260435992175,
          lng: 9.72345094553722
        }
      });
    expect(res.body.data.length).toEqual(3);
      const res2 = await request(app)
        .get('/jobstack/' + USER_ONE._id)
        .send();
      expect(res2.body.data.clientStack.length).toEqual(5);
      done();
  });
  it('should not get jobs outside of the specified radius', async (done) => {
    await request(app)
      .post('/create-job')
      .send({
        job: {
          title: "distance > radius",
          description: "test123",
          creator: "5ee24164c71c594a94003ea3",
          location: {
            lat: 51.5260435992175,
            lng: 9.72345094553722
          }
        }
      });
    const res2 = await request(app)
      .get('/jobstack/' + USER_ONE._id)
      .send();
    expect(res2.body.data.clientStack.length).toEqual(5);
    JOB_ONE = res2.body.data.clientStack[0];
    JOB_TWO = res2.body.data.clientStack[1];
    done();
  });
});

describe('test like job', () => {
  it('should remove job from client stack', async (done) => {
    const res = await request(app)
      .put('/decision')
      .send({
        user: USER_ONE,
        jobID: JOB_ONE,
        coords: {
          lat: 51.3260435992175,
          lng: 9.72345094553722
        },
        isLike: true,
        stackLength: 2
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    done();
  });
  it('should be added to liked jobs in jobStack', async (done) => {
    const res = await request(app)
      .get('/jobstack/' + USER_ONE._id)
      .send();
    expect(res.body.data.likedJobs.some((x) => x.toString() === JOB_ONE.toString())).toBe(true);
    expect(res.body.data.swipedJobs.some((x) => x.toString() === JOB_ONE.toString())).toBe(true);
    expect(res.body.data.likedJobs.length).toEqual(1);
    expect(res.body.data.clientStack.length).toEqual(4);
    done();
  });
});

describe('test dislike job', () => {
  it('should remove job from client stack', async (done) => {
    const res = await request(app)
      .put('/decision')
      .send({
        user: USER_ONE,
        jobID: JOB_TWO,
        coords: {
          lat: 51.3260435992175,
          lng: 9.72345094553722
        },
        isLike: false,
        stackLength: 2
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toEqual(1);
    done();
  });
  it('should not be added to liked jobs in jobStack', async (done) => {
    const res = await request(app)
      .get('/jobstack/' + USER_ONE._id)
      .send();
    expect(res.body.data.likedJobs.some((x) => x.toString() === JOB_TWO.toString())).toBe(false);
    expect(res.body.data.swipedJobs.some((x) => x.toString() === JOB_TWO.toString())).toBe(true);
    expect(res.body.data.likedJobs.length).toEqual(1);
    expect(res.body.data.swipedJobs.length).toEqual(2);
    expect(res.body.data.clientStack.length).toEqual(3);
    done();
  });
});

describe('test serverStack', () => {
  it('should fill the client stack and server stack', async (done) => {
    for (let i = 0; i < 35; i++) {
      await request(app)
        .post('/create-job')
        .send({
          job: {
            title: "job",
            description: "test123",
            creator: "5ee24164c71c594a94003ea3",
            location: {
              lat: 51.3260435992175,
              lng: 9.72345094553722
            }
          }
        });
    }
    const jobStackTest = await request(app)
      .put('/job-stack')
      .send({
        user: USER_ONE,
        coords: {
          lat: 51.3260435992175,
          lng: 9.72345094553722
        }
      });
    expect(jobStackTest.body.data.length).toEqual(3);
    const res = await request(app)
      .get('/jobstack/' + USER_ONE._id)
      .send();
    expect(res.body.data.clientStack.length).toEqual(13);
    JOBS_TO_LIKE = res.body.data.clientStack;
    expect(res.body.data.serverStack.length).toEqual(10);
    expect(res.body.data.backLog.length).toEqual(15);
    done();
  });
});

describe('test refill clientStack', () => {
  it('should refill the clientStack once it only contains 5 jobs', async (done) => {
    for(let i = 0; i < 8; i++) {
      await request(app)
        .put('/decision')
        .send({
          user: USER_ONE,
          jobID: JOBS_TO_LIKE[i],
          coords: {
            lat: 51.3260435992175,
            lng: 9.72345094553722
          },
          isLike: true
        });
    }
    const res = await request(app)
      .get('/jobstack/' + USER_ONE._id)
      .send();
    expect(res.body.data.clientStack.length).toEqual(15);
    expect(res.body.data.serverStack.length).toEqual(10);
    expect(res.body.data.backLog.length).toEqual(5);
    done();
  });
});

describe('repopulate backlog', () => {
  it('should look for new jobs in backlog if position changes', async (done) => {
    await request(app)
      .put('/update-backlog')
      .send({
        user: USER_ONE,
        coords: {
          lat: 53.3260435992175,
          lng: 9.92345094553722
        }
      });
    const res = await request(app)
      .get('/jobstack/' + USER_ONE._id)
      .send();
    expect(res.body.data.clientStack.length).toEqual(10);
    expect(res.body.data.serverStack.length).toEqual(0);
    expect(res.body.data.backLog.length).toEqual(0);
    done();
  });
});

