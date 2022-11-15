const customerWhatsAppInfo = require("@/models/erpModels/customerWhatsAppInfo")

exports.numberChecker = async (req, res, next) => {
    try {
        const Wprofile = req?.body?.entry[0]?.changes[0]?.value?.contacts[0];
        if (Wprofile !== undefined) {
            console.log(Wprofile?.wa_id)
            const info = await customerWhatsAppInfo.findOne({ senderNumber: Wprofile?.wa_id })
            if (!info) {
                const result = await new customerWhatsAppInfo({
                    senderNumber: Wprofile?.wa_id,
                    name: Wprofile?.profile?.name
                }).save();
            } else if (info.name !== Wprofile.profile?.name) {
                const result = await customerWhatsAppInfo.findOneAndUpdate(
                    { senderNumber: Wprofile?.wa_id },
                    {
                        $set: {
                            senderNumber: Wprofile?.wa_id,
                            name: Wprofile?.profile?.name
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
