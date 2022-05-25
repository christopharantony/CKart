const mongoose = require('mongoose');

const savedSchema =new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDb'
    },
    name:{
        type:String,
        required: true
    },
    phone:{
        type:String,
        required: true
    },
    pincode:{
        type:String,
        required: true
    },
    address:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    }
});

const savedAddressModel = mongoose.model('savedAddressDb',savedSchema);

module.exports = savedAddressModel;