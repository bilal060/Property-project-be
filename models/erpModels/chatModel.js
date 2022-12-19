const mongoose = require("mongoose");

const chatModel = new mongoose.Schema({
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", autopopulate: { select: " -password" }, maxDepth: 1 }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message", autopopulate: true },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", autopopulate: { select: " -password" }, },
},
    { timestamps: true });

chatModel.plugin(require('mongoose-autopopulate'));

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;