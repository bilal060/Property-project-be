const mongoose = require("mongoose");

const CountriesSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
        },
        name: {
            type: String,
        },
        iso3: {
            type: String,
        },
        iso2: {
            type: String,
        },
        numeric_code: {
            type: String,
        },
        phone_code: {
            type: String,
        },
        capital: {
            type: String,
        },
        currency: {
            type: String,
        },
        currency_name: {
            type: String,
        },
        currency_symbol: {
            type: String,
        },
        tld: {
            type: String,
        },
        native: {
            type: String,
        },
        region: {
            type: String,
        },
        subregion: {
            type: String,
        },
        timezones: {
            type: Array,
        },

        latitude: {
            type: String,
        },
        longitude: {
            type: String,
        },
        emoji: {
            type: String,
        },
        emojiU: {
            type: String,
        },
    },
    {
        timestamps: false,
    }
);

module.exports = mongoose.model("Countries", CountriesSchema);
