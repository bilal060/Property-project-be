const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: " -password" }, maxDepth: 1 },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", autopopulate: true },
    /* readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], */
},
    { timestamps: true });

messageSchema.plugin(require('mongoose-autopopulate'));

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;