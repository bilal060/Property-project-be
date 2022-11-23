const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    removed: {
        type: Boolean,
        default: false,
    },
    isFacebookLogin: {
        type: Boolean,
        default: false,
    },
    isGoogleLogin: {
        type: Boolean,
        default: false,
    },
    isSocialLogin: {
        type: Boolean,
        default: false,
    },
    socialId: { type: String, required: true, default: null },
    enabled: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
    },
    company: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    about: {
        type: String,
    },

    photo: {
        type: String,
        trim: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    role: { type: mongoose.Schema.ObjectId, ref: 'Role', autopopulate: { select: "displayName  roleType  removed" }, maxDepth: 1 },
    isLoggedIn: { type: Boolean },
}, { timestamps: true });

UserSchema.plugin(require('mongoose-autopopulate'));
// generating a hash
UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
