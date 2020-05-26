const server = require('../server.js');
const app = server.app;
const request = require('supertest');
import {describe, it, expect, beforeAll, afterAll} from 'jest-without-globals'
const dbHandler = require('./database-handler');
const User = require('../models/user');
/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await dbHandler.connect());

/**
 * Clear all test data after every test.
 */
// afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase());



describe('Register new User', () => {
    const user1 = new User({ firstName: 'Test', lastName: 'Test1', email: 'abc@abcd.de', password: 'Test123' });
    it('should create a new user', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                user: user1
            })
        expect(res.statusCode).toEqual(201);
    });
    it('should fail if email exists', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                user: user1
            })
        expect(res.statusCode).toEqual(400)
    });
    it('should fail if password is missing', async () => {
        const user2 = new User({ firstName: 'Test', lastName: 'Test1', email: 'abc@abcd.de', password: '' });
        const res = await request(app)
            .post('/register')
            .send({
                user: user2
            })
        expect(res.statusCode).toEqual(400)
    });
    it('should fail if email is invalid', async () => {
        const user2 = new User({ firstName: 'Test', lastName: 'Test1', email: 'abc@abcd', password: 'Test123' });
        const res = await request(app)
            .post('/register')
            .send({
                user: user2
            })
        expect(res.statusCode).toEqual(400)
    });
});

describe('Login User', () => {
    it('should successfully log in', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: 'abc@abcd.de',
                password: 'Test123'
            })
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body.data).toBe('object');
        expect(res.body.data.password).toBe(undefined);
    });
    it('should fail with wrong password', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                email: 'abc@abcd.de',
                password: 'Test123456'
            })
        expect(res.statusCode).toEqual(400);
    });
});

