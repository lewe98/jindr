export {};
const mongoose = require('mongoose');


const jobSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required.'], trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required.'], trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: new Date()
  },
  time: {
    type: Number,
    default: 8
  },
  payment: {
    type: Number,
    default: 12
  },
  tile: {
    type: Number
  },
  interestedUsers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  location: {
    type: {lat: Number, lng: Number}
  },
  isFinished: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: './assets/images/job.png'
  },
  interest: {
    type: [],
    default: []
  }
});

module.exports = mongoose.model('Job', jobSchema, 'jobs');
