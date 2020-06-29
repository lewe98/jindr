export {};
const mongoose = require('mongoose');
const messageWrapperSchema = mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employerLastViewed: {
    type: Number,
    default: Date.now()
  },
  employeeLastViewed: {
    type: Number,
    default: 0
  },
  employerName: {
    type: String
  },
  employeeName: {
    type: String
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  jobID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  messages: {
    type: [],
    default: []
  },
  employeeImage: {
    type: String
  },
  employerImage: {
    type: String
  }
})
module.exports = mongoose.model('MessageWrapper', messageWrapperSchema, 'messageWrappers');
