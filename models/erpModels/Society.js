const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('events').EventEmitter.prototype._maxListeners = 0;


const societSchema = new mongoose.Schema({
  name: {
    type: String,
    default: false,
  },
  ownerName: {
    type: String,
   
  },
  address: {
    type: String,
    trim: true,
  },
  managerName: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
    trim: true,
  },
  removed: {
    type: Boolean,
    default: false,
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
  updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },

}, { timestamps: true });

societSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Society', societSchema);
