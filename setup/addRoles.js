require('dotenv').config({ path: __dirname + '/../.variables.env' });
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
const roles = [{
    codeName: uuidv4(),
    displayName: "Super Admin",
    roleType: "superAdmin",
}, {
    codeName: uuidv4(),
    displayName: "Agent",
    roleType: "Agent",
}
    , {
    codeName: uuidv4(),
    displayName: "Customer",
    roleType: "Customer",
}
]
async function createRoles() {
    try {
        const Roles = require('../models/erpModels/Role');
        var newRoles = new Roles();

        await new Roles({
            codeName: uuidv4(),
            displayName: "Super Admin",
            roleType: "superAdmin",

        }).save();
        console.log('👍👍👍👍👍👍👍👍 Roles created : Done!');
        process.exit();
    } catch (e) {
        console.log('\n👎👎👎👎👎👎👎👎 Error! The Error info is below');
        console.log(e);
        process.exit();
    }
}
createRoles();
