const mongoose = require('mongoose');

const productschema = new mongoose.Schema({
    Name:{
        type: String,
        required: true
    }, 
    Price:{
        type: String,
        required: true
    },
    Quantity:{
        type:Number,
        required:true
    },
    Description:String,
    Category:String,
    Image:String

});

const productModel = mongoose.model('productDb',productschema);

module.exports = productModel;