const mongoose = require('mongoose');
const m2s = require('mongoose-to-swagger');
const Model = mongoose.model('Client')
const swaggerSchema = m2s(Model);

module.exports = {
    // operation's method
    post: {
        tags: ["Todo CRUD operations"], // operation's tag
        description: "", // short desc
        operationId: "create", // unique operation id
        parameters: [], // expected params
        requestBody: {
            // expected request body
            content: {
                // content-type
                "application/json": {
                    schema: swaggerSchema,
                },
            },
        },
        // expected responses
        responses: {
            // response code
            201: {
                description: "Todo created successfully", // response desc
            },
            // response code
            500: {
                description: "Server error", // response desc
            },
        },
    },
};