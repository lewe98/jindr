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
  }
});

module.exports = mongoose.model('Job', jobSchema, 'jobs');
