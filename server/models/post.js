const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = Schema({
    title:{
        type: String,
        required: true,
        unique: true
    },

    body: {
        type: String,
        required: true,
    },

    description:{
        type: String,
    },

    author:{
        type: mongoose.Schema.Types.Mixed,
    },

    state:{
        type: String,
        enum: ["draft", "published"], 
        default:"draft"
    },

    read_count:{
        type: Number,
    },

    read_count: {
        type: Number,
        default: 0 
    },

    last_read_at: {
        type: Date
    },

    reading_time:{
        type: String,
    },

    tags:{
        type: String,
    },

    createdAt:{
        type: Date,
        default: Date.now
    },

    updatedAt:{
        type: Date,
        default: Date.now
    },
    
}, 
// { typeKey: '$type' }
);

module.exports = mongoose.model('Post', PostSchema);