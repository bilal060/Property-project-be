const mongoose = require('mongoose');
const Role = mongoose.model('Role');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const rolesController = {
    readRole: async (req, res) => {
        try {
            // Find document by id
            const result = await Role.findOne({ _id: req.params.id, removed: false });
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
    createRole: async (req, res) => {
        try {
            const body = { ...req.body }
            body.codeName = uuidv4();
            body.createdBy = req.user._id.toString()
            const result = await new Role(body).save();
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
    updateRole: async (req, res) => {
        try {
            const body = { ...req.body }
            body.updatedBy = req.user._id.toString();
            // Find document by id and updates with the required fields
            const result = await Role.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
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
    deleteRole: async (req, res) => {
        try {
            // Find the document by id and delete it
            let updates = {
                removed: true,
            };
            // Find the document by id and delete it
            const result = await Role.findOneAndUpdate(
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
    listRole: async (req, res) => {
        const { society, phase, block, featured, user } = req.query
        const page = req.query.page || 1;
        const limit = parseInt(req.query.items) || 10;
        const skip = page * limit - limit;
        try {
            let query = { removed: false }
            if (society) {
                query.society = society
            } else if (phase) {
                query.phase = phase
            } else if (block) {
                query.block = block
            } else if (society && phase) {
                query.society = society
                query.phase = phase
            }
            else if (phase && block) {
                query.phase = phase
                query.block = block
            }
            if (society && phase && block) {
                query.phase = phase
                query.block = block
                query.society = society
            }
            if (featured) {
                query.featured = featured
            }
            if (user) {
                query.createdBy = user
            }
            //  Query the database for a list of all results
            const resultsPromise = Role.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ created: 'desc' })
                .populate();
            // Counting the total documents
            const countPromise = Role.count(query);
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
    searchRole: async (req, res) => {
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
            let results = await Role.find(fields).where('removed', false).limit(10);
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
    filterRole: async (req, res) => {
        try {
            if (req.query.filter === undefined || req.query.equal === undefined) {
                return res.status(403).json({
                    success: false,
                    result: null,
                    message: 'filter not provided correctly',
                });
            }
            const result = await Role.find({ removed: false })
                .where(req.query.filter)
                .equals(req.query.equal);
            return res.status(200).json({
                success: true,
                result,
                message: 'Successfully found all documents where equal to : ' + req.params.equal,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                result: null,
                message: 'Oops there is an Error',
                error: err,
            });
        }
    },
    statusRole: async (req, res) => {
        try {
            if (req.query.enabled == 'true' || req.query.enabled == 'false') {
                let updates = {
                    enabled: req.query.enabled,
                };
                // Find the document by id and delete it
                const result = await Role.findOneAndUpdate(
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
                        message: 'Successfully update status of this document by id: ' + req.params.id,
                    });
                }
            } else {
                return res
                    .status(202)
                    .json({
                        success: false,
                        result: [],
                        message: "couldn't change admin status by this request",
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
    getFilterbyDateRole: async (req, res) => {
        try {
            const { filter, equal, date } = req.params;
            let day = null;
            if (date == 'today') {
                day = moment().format('DD/MM/YYYY');
            } else if (date == 'tomorrow') {
                day = moment().add(1, 'days').format('DD/MM/YYYY');
            } else {
                day = moment(date, 'DD-MM-YYYY').format('DD/MM/YYYY');
            }
            const result = await Role.find({ removed: false })
                .where(filter)
                .equals(equal)
                .where('date')
                .equals(day);
            if (result.length == 0) {
                return res.status(400).json({
                    success: false,
                    result: [],
                    message: 'Date not found for this api',
                });
            }
            return res.status(200).json({
                success: true,
                result,
                message: 'Successfully found all documents where equal to : ' + equal,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                result: null,
                message: 'Oops there is an Error',
                error: err,
            });
        }
    },
    addOrRemovePermissions: async (req, res) => {
        try {
            const body = { ...req.body }
            const docs = await Role.findOne({
                _id: req.params.id, permissions: { $all: body.permissions }
            })
            let result;
            if (docs) {
                
                result = await Role.findOneAndUpdate({ _id: req.params.id, removed: false },
                    {
                        // $pull: {
                        //     permissions: body.permissions,
                        // }
                        $pullAll: { 'permissions': body.permissions }
                    }
                    ,

                    {
                        new: true, // return the new result instead of the old one
                        runValidators: true,
                    }).exec();
            } else {
               
                result = await Role.findOneAndUpdate({ _id: req.params.id, removed: false }, {
                    $addToSet: {
                        permissions: body.permissions,
                    }
                }, {
                    new: true, // return the new result instead of the old one
                    runValidators: true,
                }).exec();
            }
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

                console.log(err)
                return res.status(500).json({
                    success: false,
                    result: null,
                    message: 'Oops there is an Error',
                    error: err,
                });
            }
        }
    },
}

module.exports = rolesController;