const mongoose = require('mongoose')
require('dotenv').config()


mongoose.connect(process.env.LOCAL_DB)
.then(() => {
    console.log("DB IS ON")
}).catch((err) => {
    console.log('Db is off ' + err)
})



const Schema = new mongoose.Schema({
    username:{
        type:String,
        required: true
    },
    email: {
        type: String,
        unique:true,
        required: true
    },
    password: {
        type: String,
        required: true
    }

})
const Users = new mongoose.model('Users', Schema)

module.exports = Users;