const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
})

//passing in the result of requiring passport-local-mongoose
UserSchema.plugin(passportLocalMongoose) // add on username and password field 

module.exports = mongoose.model("User", UserSchema);