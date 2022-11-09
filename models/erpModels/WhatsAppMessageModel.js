const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaRefSchema = new Schema({
    mediaRefData: {
        type: Object,
    },
}, { timestamps: true });

module.exports = mongoose.model('MediaRef', MediaRefSchema);
