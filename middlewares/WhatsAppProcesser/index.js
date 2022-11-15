exports.getWhatsAppInfo = async (req, res, next) => {
    try {
        

    } catch (err) {
        res.status(503).json({
            success: false,
            result: null,
            message: err.message,
            error: err,
        });
    }
};
