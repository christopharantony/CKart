const mongoose = require('mongoose');

const productschema = new mongoose.Schema({
    Name:{
        type: String,
        required: true
    }, 
    Price:{
        type: Number,
        required: true
    },
    Quantity:{
        type: Number,
        required:true
    },
    Brand:{
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref:'brandDb',
        required:true
    },
    Category :{
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        ref: 'categoryDb'
    },
    Description:{
        type: String,
        required: true
    },
    Image:String

});

const productModel = mongoose.model('productDb',productschema);

module.exports = productModel;