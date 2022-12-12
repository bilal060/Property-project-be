const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const CitiesSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
        },
        name: {
            type: String,
        },
        country: { type: mongoose.Schema.ObjectId, ref: 'Countries', autopopulate: true, maxDepth: 1 },
        state: { type: mongoose.Schema.ObjectId, ref: 'States', autopopulate: true, maxDepth: 1 },

        latitude: {
            type: String,
        },
        longitude: {
            type: String,
        },
        wikiDataId: {
            type: String,
        },
    },
    {
        timestamps: false,
    }
);
// @ts-ignore
CitiesSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("Cities", CitiesSchema);
