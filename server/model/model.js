const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    }, 
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    status:{
        type: Boolean,
        default: false
    },
    number:{
        type:Number,
        required:true,
        unique:true
    },
    gender: String
    
});

const model = mongoose.model('userDb',schema);

module.exports = model;