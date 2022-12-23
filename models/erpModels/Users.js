const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    socialId: { type: String, default: null },
    enabled: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,

    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,

    },
    company: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,

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
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    removed: {
        type: Boolean,
        default: false,
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
