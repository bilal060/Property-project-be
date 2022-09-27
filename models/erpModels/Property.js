const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('events').EventEmitter.prototype._maxListeners = 0;

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
  },
  type: {
    type: String,
  },
  rooms: {
    type: Number,
  },

  price: {
    type: Number,
  },

  area: {
    type: Number,
  },

  address: {
    type: String,
  },
  features: {
    type: Array
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  age: {
    type: String,
  },
  bathrooms: {
    type: String,
  },

  condition: {
    type: String
  },
  ctInfoName: {
    type: String
  },
  ctInfoUsername: {
    type: String
  },
  ctInfoEmail: {
    type: String
  },
  ctInfoPhone: {
    type: String
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    autopopulate: true,
    required: true,
  },
  phase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phase',
    autopopulate: true,
    required: true,
  },
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    autopopulate: true,
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  removed: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: Array,
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
  updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },

}, { timestamps: true });
PropertySchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Property', PropertySchema);
