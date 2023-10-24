const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        
    },

    first_name:{
        type: String,
        required: true,
    },

    last_name:{
        type: String,
        required: true,
    },

    email:{
        type: String,
        required: true,
        unique: true,
    },
}, 
// { typeKey: '$type' }
);

module.exports = mongoose.model('User', UserSchema);