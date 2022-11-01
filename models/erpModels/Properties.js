const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const PropertiesListingSchema = new mongoose.Schema({
    PlotSize: {
        type: String,
        default: "",
    },
    PlotNo: {
        type: String,
        default: "",
    },
    Society: { type: mongoose.Schema.ObjectId, ref: 'Society', autopopulate: true, maxDepth: 1 },
    FileNo: {
        type: String,
        default: "",
    },
    Phase: {
        type: String,
        default: "",
    },
    Sector: {
        type: String,
        default: "",
    },

    SubProject: {
        type: String,
        default: "",
    },
    RefNo: {
        type: String,
        default: ''
    },
    SecNo: {
        type: String,
        default: ''
    },
    CommunityCenter: {
        type: String,
        default: ""
    },
    removed: {
        type: Boolean,
        default: false,
    },
    owner: { type: mongoose.Schema.ObjectId, ref: 'PropertyOwners', autopopulate: true, maxDepth: 1 },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },

}, { timestamps: true });
PropertiesListingSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('PropertiesListing', PropertiesListingSchema);
