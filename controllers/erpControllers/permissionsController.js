const mongoose = require('mongoose');
const Permission = mongoose.model('Permission');
const permissionsController = {
    readPermission: async (req, res) => {
        try {
            // Find document by id
            const result = await Permission.findOne({ _id: req.params.id, removed: false });
            // If no results found, return document not found
            if (!result) {
                return res.status(404).json({
                    success: false,
                    result: null,
                    message: 'No document found by this id: ' + req.params.id,
                });
            } else {
                // Return success resposne
                return res.status(200).json({
                    success: true,
                    result,
                    message: 'we found this document by this id: ' + req.params.id,
                });
            }
        } catch (err) {
            // Server Error
            return res.status(500).json({
                success: false,
                result: null,
                message: 'Oops there is an Error',
                error: err,
            });
        }
    },
    createPermission: async (req, res) => {
        try {
            const body = { ...req.body }

            const result = await new Permission(body).save();
            console.log(body)
            return res.status(200).json({
                success: true,
                result,
                message: 'Successfully Created',
            });
        } catch (err) {
            if (err.name == 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    result: null,
                    message: 'Required fields are not supplied',
                    error: err,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    result: null,
                    message: 'Oops there is an Error',
                    error: err,
                });
            }
        }
    },
    updatePermission: async (req, res) => {
        try {
            const body = { ...req.body }
            const result = await Permission.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
                new: true, // return the new result instead of the old one
                runValidators: true,
            }).exec();
            if (!result) {
                return res.status(404).json({
                    success: false,
                    result: null,
                    message: 'No document found by this id: ' + req.params.id,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    result,
                    message: 'we update this document by this id: ' + req.params.id,
                });
            }
        } catch (err) {
            if (err.name == 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    result: null,
                    message: 'Required fields are not supplied',
                    error: err,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    result: null,
                    message: 'Oops there is an Error',
                    error: err,
                });
            }
        }
    },
    deletePermission: async (req, res) => {
        try {
            // Find the document by id and delete it
            let updates = {
                removed: true,
            };
            // Find the document by id and delete it
            const result = await Permission.findOneAndUpdate(
                { _id: req.params.id, removed: false },
                { $set: updates },
                {
                    new: true, // return the new result instead of the old one
                }
            ).exec();
            // If no results found, return document not found
            if (!result) {
                return res.status(404).json({
                    success: false,
                    result: null,
                    message: 'No document found by this id: ' + req.params.id,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    result,
                    message: 'Successfully Deleted the document by id: ' + req.params.id,
                });
            }
        } catch (err) {
            return res.status(500).json({
                success: false,
                result: null,
                message: 'Oops there is an Error',
                error: err,
            });
        }
    },
    listPermission: async (req, res) => {
        const { user } = req.query
        const page = req.query.page || 1;
        const limit = parseInt(req.query.items) || 10;
        const skip = page * limit - limit;
        try {
            let query = { removed: false }
            // if (user) {
            //     query.createdBy = user
            // }
            //  Query the database for a list of all results
            const resultsPromise = Permission.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ created: 'desc' })
                .populate();
            // Counting the total documents
            const countPromise = Permission.count(query);
            // Resolving both promises
            const [result, count] = await Promise.all([resultsPromise, countPromise]);
            // Calculating total pages
            const pages = Math.ceil(count / limit);
            // Getting Pagination Object
            const pagination = { page, pages, count };
            if (count > 0) {
                return res.status(200).json({
                    success: true,
                    result,
                    pagination,
                    message: 'Successfully found all documents',
                });
            } else {
                return res.status(203).json({
                    success: false,
                    result: [],
                    pagination,
                    message: 'Collection is Empty',
                });
            }
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                success: false,
                result: [],
                message: 'Oops there is an Error',
                error: err,
            });
        }
    },
    searchPermission: async (req, res) => {
        if (req.query.q === undefined || req.query.q.trim() === '') {
            return res
                .status(202)
                .json({
                    success: false,
                    result: [],
                    message: 'No document found by this request',
                })
                .end();
        }
        const fieldsArray = req.query.fields
            ? req.query.fields.split(',')
            : ['name', 'surname', 'birthday'];
        const fields = { $or: [] };
        for (const field of fieldsArray) {
            fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, 'i') } });
        }
        try {
            let results = await Permission.find(fields).where('removed', false).limit(10);
            if (results.length >= 1) {
                return res.status(200).json({
                    success: true,
                    result: results,
                    message: 'Successfully found all documents',
                });
            } else {
                return res
                    .status(202)
                    .json({
                        success: false,
                        result: [],
                        message: 'No document found by this request',
                    })
                    .end();
            }
        } catch (err) {
            return res.status(500).json({
                success: false,
                result: null,
                message: 'Oops there is an Error',
                error: err,
            });
        }
    },




}

module.exports = permissionsController;