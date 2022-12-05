const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
require('dotenv').config({ path: '.variables.env' });

exports.isValidAdminToken = async (req, res, next) => {
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

        const admin = await User.findOne({ _id: verified.id, removed: false });
        if (!admin) {
            return res.status(401).json({
                success: false,
                result: null,
                message: "Admin doens't Exist, authorization denied.",
                jwtExpired: true,
            });
        }

        if (admin.isLoggedIn === false) {
            return res.status(401).json({
                success: false,
                result: null,
                message: 'Admin is already logout try to login, authorization denied.',
                jwtExpired: true,
            });
        }

        if (admin.role.roleType !== 'superadmin')
            return res.status(401).json({
                success: false,
                result: null,
                message: 'Access denied',
                jwtExpired: true,
            });

        else {
            req.user = admin;
            next();
        }
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




exports.isValidAgent = async (req, res, next) => {
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

        const agent = await User.findOne({ _id: verified.id, removed: false });
        if (!agent)
            return res.status(401).json({
                success: false,
                result: null,
                message: "Agent doens't Exist, authorization denied.",
                jwtExpired: true,
            });

        if (agent.isLoggedIn === false)
            return res.status(401).json({
                success: false,
                result: null,
                message: 'Agent is already logout try to login, authorization denied.',
                jwtExpired: true,
            });

        if (agent.role.roleType !== 'agent')
            return res.status(401).json({
                success: false,
                result: null,
                message: 'Access denied',
                jwtExpired: true,
            });
        else {
            req.user = agent;
            next();
        }
    } catch (err) {
        res.status(503).json({
            success: false,
            result: null,
            message: err?.message,
            error: err,
        });
    }
};



exports.isLoggedin = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token)
            return res.status(400).json({
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

        const user = await User.findOne({ _id: verified.id, removed: false });
        if (!user)
            return res.status(401).json({
                success: false,
                result: null,
                message: "user doens't Exist, authorization denied.",
                jwtExpired: true,
            });
        req.user = user;
        next();
    } catch (err) {
        res.status(503).json({
            success: false,
            result: null,
            message: err?.message,
            error: err,
        });
    }
};



