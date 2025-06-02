const mongoose = require('mongoose');

const dbConnection=()=>{
    mongoose.connect(process.env.DB_URI)
    .then((conn) =>{
        console.log(`DataBase connected successfully : ${conn.connection.host}`)
    }).catch((err)=>{
        console.log(`Error Connected : ${err}`)
    })
};
module.exports =dbConnection;