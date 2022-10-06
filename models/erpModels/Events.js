const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const EventsSchema = new Schema({
    title: {
        type: String,
    },
    start: {
        type: String,
    },
    end: {
        type: String,
    },
    description: {
        type: String,
    },
    removed: {
        type: Boolean,
        default: false,
    },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },

}, { timestamps: true });

EventsSchema.plugin(require('mongoose-autopopulate'));


module.exports = mongoose.model('Events', EventsSchema);
