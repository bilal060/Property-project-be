const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate")
const StatesSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
        },
        name: {
            type: String,
        },
        country: { type: mongoose.Schema.ObjectId, ref: 'Countries', autopopulate: true, maxDepth: 1 },
        state_code: {
            type: String,
        },
        latitude: {
            type: String,
        },
        longitude: {
            type: String,
        },
    },
    {
        timestamps: false,
    }
);
// @ts-ignore
StatesSchema.plugin(autopopulate);
module.exports = mongoose.model("States", StatesSchema);
