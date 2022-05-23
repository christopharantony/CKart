const mongoose = require('mongoose');

const savedSchema =new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDb'
    },
    address:{
        type:String,
        required:true
    }
});

const savedAddressModel = mongoose.model('savedAddressDb',savedSchema);

module.exports = savedAddressModel;