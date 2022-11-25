require('dotenv').config({ path: '../../../.variables.env' });
const axios = require("axios");
const message = require("@/models/erpModels/messageModel");
const customerWhatsAppInfo = require("@/models/erpModels/customerWhatsAppInfo");

const WhatsAppCntrl = {
    CreateMessage: async (req, res) => {
        try {
            const asBody = req.body.entry[0].changes[0].value;

            if (asBody.messages[0].type === "image") {
                axios
                    .get(
                        `https://graph.facebook.com/v15.0/${asBody.messages[0].image.id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${process.env.FacebookToken}`,
                            },
                        }
                    )
                    .then((resp) => {
                        axios
                            .get(resp?.data?.url, {
                                resType: "stream",
                                headers: {
                                    Authorization:
                                        `Bearer ${process.env.FacebookToken}`,
                                },
                            })
                            .then(async (respp) => {
                                try {
                                    const writer = fs.createWriteStream(
                                        `./Assets/Received/${asBody.messages[0].id}.jpeg`
                                    );
                                    respp.data.pipe(writer);
                                    const result = await new message({
                                        message: { body: asBody, way: "receive" },
                                    }).save();


                                    return res.status(200).json({
                                        success: true,
                                        result,
                                        message: "Successfully Created",
                                    });
                                } catch {
                                    return res.status(500).json({
                                        success: false,
                                        message: "File Writing Failed",
                                    });
                                }
                            });
                    })
                    .catch((err) => {
                        console.log(err)

                    });
            } else if (asBody.messages[0].type === "audio") {

                axios
                    .get(
                        `https://graph.facebook.com/v15.0/${asBody.messages[0].audio.id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${process.env.FacebookToken}`,
                            },
                        }
                    )
                    .then((resp) => {
                        //console.log(resp?.data);
                        axios
                            .get(resp?.data?.url, {
                                resType: "stream",
                                headers: {
                                    Authorization:
                                        `Bearer ${process.env.FacebookToken}`,
                                },
                            })
                            .then(async (res) => {
                                try {
                                    const writer = fs.createWriteStream(
                                        `./Assets/Received/${asBody.messages[0].id}.ogg`
                                    );
                                    res.data.pipe(writer);
                                    const result = await new message({
                                        message: { body: asBody, way: "receive" },
                                    }).save();
                                    return res.status(200).json({
                                        success: true,
                                        result,
                                        message: "Successfully Created",
                                    });
                                } catch {
                                    return res.status(500).json({
                                        success: false,
                                        message: "File Writing Failed",
                                    });
                                }
                            });
                    })
                    .catch((err) => {
                        ;
                    });
            }
            else if (asBody.messages[0].type === "document") {

                axios
                    .get(
                        `https://graph.facebook.com/v15.0/${asBody.messages[0].document.id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${process.env.FacebookToken}`,
                            },
                        }
                    )
                    .then((resp) => {
                        axios
                            .get(resp?.data?.url, {
                                resType: "stream",
                                headers: {
                                    Authorization:
                                        `Bearer ${process.env.FacebookToken}`,
                                },
                            })
                            .then(async (res) => {
                                try {
                                    const writer = fs.createWriteStream(
                                        `./Assets/Received/${asBody.messages[0].id}.pdf`
                                    );
                                    res.data.pipe(writer);
                                    const result = await new message({
                                        message: { body: asBody, way: "receive" },
                                    }).save();
                                    writer.on("error", (err) => {
                                        // ;
                                    });
                                    writer.on("error", (err) => {
                                        // ;
                                    });
                                    return res.status(200).json({
                                        success: true,
                                        result,
                                        message: "Successfully Created",
                                    });
                                } catch {
                                    return res.status(500).json({
                                        success: false,
                                        message: "File Writing Failed",
                                    });
                                }
                            });
                    })
                    .catch((err) => {
                    });
            }
            else if (asBody.messages[0].type === "video") {
                axios
                    .get(
                        `https://graph.facebook.com/v15.0/${asBody.messages[0].video.id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${process.env.FacebookToken}`,
                            },
                        }
                    )
                    .then((resp) => {
                        //console.log(resp?.data);
                        axios
                            .get(resp?.data?.url, {
                                resType: "stream",
                                headers: {
                                    Authorization:
                                        `Bearer ${process.env.FacebookToken}`,
                                },
                            })
                            .then(async (res) => {
                                try {
                                    const writer = fs.createWriteStream(
                                        `./Assets/Received/${asBody.messages[0].id}.mp4`
                                    );
                                    res.data.pipe(writer);
                                    const result = await new message({
                                        message: { body: asBody, way: "receive" },
                                    }).save();
                                    writer.on("error", (err) => {
                                        // ;
                                    });
                                    writer.on("error", (err) => {
                                        // ;
                                    });
                                    return res.status(200).json({
                                        success: true,
                                        result,
                                        message: "Successfully Created",
                                    });
                                } catch {
                                    return res.status(500).json({
                                        success: false,
                                        message: "File Writing Failed",
                                    });
                                }
                            });
                    })
                    .catch((err) => {
                    });
            }
            else if (asBody.messages[0].type === "text") {
                console.log(asBody.messages[0].type)
                const result = await new message({
                    message: { body: asBody, way: "receive" },
                }).save();
                return res.status(200).json({
                    success: true,
                    result,
                    message: "Successfully Created",
                });
            }

        } catch (err) {
            return res.status(500).json({
                success: false,
                result: null,
                message: "Error",
                error: err,
            })
        }
        finally {
            return res.status(200);
        }
    }
    ,
    createMsgGet: (req, res) => {
        var challenge = req.query["hub.challenge"];
        if (!challenge) return res.status(302).send({});
        else {
            return res.status(200).send(challenge);
        }
    },
    loadFile: (req, res) => {
        const messageFileId = req.query.messageId;
        const mediaType = req.query.fileType;

        if (req.query.way === "received") {
            var filePath = path.join(
                __dirname,
                mediaType === "audio"
                    ? `./Assets/Received/${messageFileId}.ogg`
                    : mediaType === "video"
                        ? `./Assets/Received/${messageFileId}.mp4`
                        : mediaType === "image"
                            ? `./Assets/Received/${messageFileId}.jpeg`
                            : mediaType === "document"
                                ? `./Assets/Received/${messageFileId}.pdf`
                                : `./Assets/Received/${messageFileId}.bin`
            );
        } else if (req.query.way === "sent") {
            var filePath = path.join(
                __dirname,
                mediaType === "audio"
                    ? `./Assets/sent/${messageFileId}`
                    : mediaType === "video"
                        ? `./Assets/sent/${messageFileId}`
                        : mediaType === "image"
                            ? `./Assets/sent/${messageFileId}`
                            : `./Assets/sent/${messageFileId}`
            );
        } else {
            res.status(500).send();
        }
        var stat = fs.statSync(filePath);
        res.writeHead(200, {
            "Content-Type":
                mediaType === "audio"
                    ? `audio/ogg`
                    : mediaType === "video"
                        ? `video/mp4`
                        : mediaType === "image"
                            ? `image/jpeg`
                            : mediaType === "document"
                                ? `application/pdf`
                                : `binary/bin`,
            "Content-Length": stat.size,
        });

        var readStream = fs.createReadStream(filePath);
        readStream.on("data", function (data) {
            res.write(data);
        });

        readStream.on("end", function () {
            res.end();
        });

    },
    loadAllMessages: async (req, res) => {
        const messages = await message
            .find({
                "message.messages.type": req.body.messageType,
                "message.contacts.wa_id": req.body.number,
            })
            .sort({ createdAt: "-1" })
            .exec();

        res.status(200).send(messages);
    },
    loadMessageByUser: async (req, res) => {
        try {
            console.log(req.params.number)
            const messages = await message
                .find({
                    "message.body.contacts.wa_id": req.params.number,
                })
                .sort({ createdAt: "-1" })
                .exec();

            res.status(200).send(messages);
        } catch (error) {
            return res.status(500).json({
                success: false,
                result: null,
                message: "Error",
                error: err,
            });
        }
    },
    lastMessage: async (req, res) => {
        try {
            const resultsPromise = await message.find().sort({ _id: -1 }).limit(1);
            return res.status(200).json({
                success: true,
                result: resultsPromise,
                message: "Successfully Created",
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                result: null,
                message: "Error",
                error: err,
            });
        }
    },
    sendTextMessage: async (req, res) => {
        axios
            .post(
                `https://graph.facebook.com/v15.0/100381879573581/messages`,
                {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: req.body.receiver,
                    type: "text",
                    text: {
                        preview_url: false,
                        body: req.body.text,
                    },
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.FacebookToken}`,
                    },
                }
            )
            .then(async (fbResp) => {

                var contact = [
                    {
                        wa_id: req.body.receiver,
                    },
                ];
                var messages = [
                    {
                        type: "text",
                        text: {
                            body: req.body.text,
                        },
                    },
                ];
                const asBody = {
                    contacts: contact,
                    messages: messages,
                };
                const result = await new message({
                    message: { body: asBody, way: "send" },
                }).save();
                res.status(200).send(result);
            });

    },
    sendMultiMediaMessage: async (req, res) => {

        const formData = new FormData();
        formData.append("messaging_product", "whatsapp");
        formData.append("file", fs.createReadStream(req.file.path));

        try {
            axios
                .post(
                    `https://graph.facebook.com/v15.0/100381879573581/media`,
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${process.env.FacebookToken}`,
                        },
                    }
                )
                .then((MediaRes) => {

                    const msg = {
                        "messaging_product": "whatsapp",
                        "recipient_type": "individual",
                        "to": req.body.receiver,
                        "type": req.body.mediaType,
                        [req.body.mediaType]: {
                            "id": MediaRes.data.id
                        }
                    }
                    axios
                        .post(
                            `https://graph.facebook.com/v15.0/100381879573581/messages`,
                            msg,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${process.env.FacebookToken}`,
                                },
                            }
                        )
                        .then(async msgDeliveryRes => {
                            var contact = [{
                                wa_id: req.body.receiver
                            }];
                            var messages = [{
                                type: req.body.mediaType,
                                id: req.body['fileName'],
                            }];
                            const asBody = {
                                contacts: contact,
                                messages: messages
                            }
                            console.log(asBody)
                            const result = await new message({ message: { body: asBody, way: 'send' } }).save();
                            res.status(200).send(result);
                        })
                });
        } catch (err) {
            console.log(err)
            res.status(200).send()
        }
    },
    getAllWhatsAppProfiles: async (req, res) => {
        try {
            const resultsPromise = await customerWhatsAppInfo.find().sort({ _id: -1 })
            return res.status(200).json({
                success: true,
                result: resultsPromise,
                message: "Successfully Get",
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                result: null,
                message: "Error",
                error: err,
            });
        }
    },
}

module.exports = WhatsAppCntrl