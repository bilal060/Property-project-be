const mongoose = require('mongoose');
mongoose
    .connect(
        "mongodb+srv://RFA:RFA@cluster0.jougdkj.mongodb.net/PropetyProjectDb?retryWrites=true&w=majority"
    )
    .then(() => {
        console.log(`Connected To Online Db Successfully...... `);
    })
    .catch((err) => {
        console.log(err)
        console.log(`Connection failed`);
    });