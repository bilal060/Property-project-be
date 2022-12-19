const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
    message: {
        type: Object,
    },
    messageWay: {
        way: String,
    }

}, { timestamps: true });

module.exports = mongoose.model('whatsAppMessage', MessageSchema);
