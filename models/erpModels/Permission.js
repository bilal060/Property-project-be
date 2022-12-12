const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const permissionSchema = new mongoose.Schema({
    removed: {
        type: Boolean,
        default: false,
    },
    displayName: {
        type: String,
        trim: false,
        required: true,
    },
    type: {
        type: String,
        trim: true,
        required: true,
    }

}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);