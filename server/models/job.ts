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
});

module.exports = mongoose.model('Job', jobSchema, 'jobs');
