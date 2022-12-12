const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.variables.env' });
const { isValidAdminToken, isValidAgent } = require("./Authentication");
exports.RoleCheck = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token)
            return res.status(401).json({
                success: false,
                result: null,
                message: 'No authentication token, authorization denied.',
                jwtExpired: true,
            });
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified)
            return res.status(401).json({
                success: false,
                result: null,
                message: 'Token verification failed, authorization denied.',
                jwtExpired: true,
            });
        if (verified.role === "superadmin" && verified.isLoggedIn) {
            isValidAdminToken(req, res, next)
        } else if (verified.role === "agent" && verified.isLoggedIn) {
            isValidAgent(req, res, next);
        } else {
            return res.status(401).json({
                success: false,
                result: null,
                message: 'Authorization denied.',
                jwtExpired: true,
            });
        }
    } catch (err) {
        res.status(503).json({
            success: false,
            result: null,
            message: err.message,
            error: err,
        });
    }
};


