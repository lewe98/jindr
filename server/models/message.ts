export {};
const mongoose = require('mongoose');


const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timeStamp: {
    type: Number,
    default: Date.now()
  },
  body: {
    type: String,
    required: [true, 'Message can not be empty.'],
  },
  type: {
    type: String,
    default: 'text'
  }
});

module.exports = mongoose.model('Message', messageSchema);
