const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const PropertyOwnersSchema = new mongoose.Schema({
    MembershipNo: {
        type: String,
        default: "",
    },

    FullName: {
        type: String,
        default: "",
    },
    CNIC: {
        type: String,
        default: "",
        validate: {
            validator: function (v) {
                return /^[0-9]{5}-[0-9]{7}-[0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid CNIC number!`
        }
    },

    TelNO: {
        type: String,
        default: "",
    },
    CellNo: {
        type: String,
        default: "",
    },
    MailingAddress: {
        type: String,
        default: "",
    },

    City: {
        type: String,
        default: "",
    },
    Rank: {
        type: String,
        default: ''
    },
    Regt: {
        type: String,
        default: ''
    },
    removed: {
        type: Boolean,
        default: false,
    },

    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },

}, { timestamps: true });
PropertyOwnersSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('PropertyOwners', PropertyOwnersSchema);
