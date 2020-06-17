export {};
const mongoose = require('mongoose');


const interestSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required.'], trim: true
  }
});

module.exports = mongoose.model('Interest', interestSchema, 'interests');
