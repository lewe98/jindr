const server = require('../server.js');
const app = server.app;
const request = require('supertest');

async function createJob(creator, location, interests) {
  return await request(app)
    .post('/create-job')
    .send({
      job: {
        title: "job",
        description: "test123",
        creator: creator,
        interests: interests,
        location: location
      }
    });
}


module.exports = {
  createJob: createJob
};
