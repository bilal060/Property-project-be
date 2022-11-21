const customerWhatsAppInfo = require("@/models/erpModels/customerWhatsAppInfo")

exports.numberChecker = async (req, res, next) => {
    try {
        const Data = req?.body?.entry[0]?.changes[0]?.value;

        if (Data?.contacts) {
            const info = await customerWhatsAppInfo.findOne({ senderNumber: Data?.contacts[0]?.wa_id })
            if (!info) {
                const result = await new customerWhatsAppInfo({
                    senderNumber: Data?.contacts[0]?.wa_id,
                    name: Data?.contacts[0]?.profile?.name
                }).save();
            } else if (info.name !== Data?.contacts[0].profile?.name) {
                const result = await customerWhatsAppInfo.findOneAndUpdate(
                    { senderNumber: Data?.contacts[0]?.wa_id },
                    {
                        $set: {
                            senderNumber: Data?.contacts[0]?.wa_id,
                            name: Data?.contacts[0]?.profile?.name
                        }
                    },
                    {
                        new: true,
                    }
                )
            }
        }
        next()
    } catch (err) {
        console.log(err)
        res.status(503).json({
            success: false,
            result: null,
            message: err.message,
            error: err,
        });
    }
};
