const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const PhaseSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  ownerName: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Active', 'InActive'],
    default: 'InActive',
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    autopopulate: true,
    required: true,
  },
  removed: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String,
    trim: true,
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
  updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },

}, { timestamps: true });
PhaseSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Phase', PhaseSchema);
