export {};
const mongoose = require('mongoose');

const jobStackSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clientStack: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Job',
    default: []
  },
  serverStack: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Job',
    default: []
  },
  backLog: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Job',
    default: []
  },
  tileID: {
    type: Number
  },
  swipedJobs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Job'
  },
  likedJobs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Job'
  }
});

module.exports = mongoose.model('JobStack', jobStackSchema, 'jobsStacks');
