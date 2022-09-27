const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const roleSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  codeName: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  displayName: {
    type: String,
    trim: true,
    required: true,
  },
  roleType: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,

  },
  created: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
