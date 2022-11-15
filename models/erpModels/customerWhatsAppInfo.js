const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const customerWhatsAppInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        // required: true,
    },
    senderNumber: {
        type: String,
        trim: true,
        // required: true,
    },
});

module.exports = mongoose.model('customerWhatsAppInfo', customerWhatsAppInfoSchema);
