const mongoose = require('mongoose');
const Message = require("../../models/erpModels/chatMessageModel");
const User = mongoose.model('User');
const Chat = require("../../models/erpModels/chatModel");
const chatsCntrl = {
    accessChat: async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            console.log("UserId param not sent with request");
            return res.sendStatus(400);
        }

        var isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage");

        //populating with the user in that latestMessage.sender in our chat doc
        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
            //1on1chat
        } else {//as per schema
            var chatData = {
                chatName: "sender", //just any string data
                isGroupChat: false,
                users: [req.user._id, userId], //both users
            };
            //console.log(chatData,'chatdata');

            try {
                const createdChat = await Chat.create(chatData);
                //console.log(createdChat, 'created and stored newChat')

                const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
                //console.log(fullChat, 'sending the created chat after populating both the user data inside the users[]');

                res.status(200).json(fullChat);
            } catch (error) {
                res.status(400);
                throw new Error(error.message);
            }
        }
    },

    fetchChats: async (req, res) => {
        try {
            Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
                .sort({ updatedAt: -1 })
                .then(async (results) => {
                    // @ts-ignore
                    results = await User.populate(results, {
                        path: "latestMessage.sender",
                        select: "name email",
                    });

                    res.status(200).send(results);
                    //console.log(results);
                });
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    },
    createGroupChat: async (req, res) => {
        if (!req.body.users || !req.body.name) {
            return res.status(400).send({ message: "Please Fill all the feilds" });
        }
        //stringified users array sent from FE //parsed here
        var users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res.status(400).send("More than 2 users are required to form a group chat");
        }

        users.push(req.user); //loggedIn user by default added to the group as an admin

        try {
            const groupChat = await Chat.create({
                chatName: req.body.name,
                users: users,
                isGroupChat: true,
                groupAdmin: req.user,
            });

            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            res.status(200).json(fullGroupChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    },
    renameGroup: async (req, res) => {
        const { chatId, chatName } = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName: chatName }, { new: true })

        if (!updatedChat) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(updatedChat);
        }
    },
    removeFromGroup: async (req, res) => {
        const { chatId, userId } = req.body;

        // check if the request is sent from admin on FE

        const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
        //console.log(removed);  

        if (!removed) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(removed);
        }
    },
    addToGroup: async (req, res) => {
        const { chatId, userId } = req.body;

        //check if the requester is admin on FE

        const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
        //console.log(added);

        if (!added) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(added);
        }
    }

}


module.exports = chatsCntrl