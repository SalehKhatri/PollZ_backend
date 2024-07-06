const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OptionSchema = new Schema({
  option: String,
  votes: {
    type: Number,
    default: 0
  }
});

const PollSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  options: [OptionSchema]
});

module.exports = mongoose.model('Poll', PollSchema);
