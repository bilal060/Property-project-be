const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');

const AppointmentsSchema = new Schema({
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,

    },
    meetingTime: {
        type: String,
    },
    removed: {
        type: Boolean,
        default: false,
    },

    confirmation: {
        type: Boolean,
        default: false,
    },

    message: {
        type: String,
    },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
    appointedTo: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
}, { timestamps: true });

AppointmentsSchema.plugin(require('mongoose-autopopulate'));


module.exports = mongoose.model('Appointment', AppointmentsSchema);
