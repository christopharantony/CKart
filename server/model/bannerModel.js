const mongoose = require('mongoose');

const bannerschema = new mongoose.Schema({
    image:{
        type: 'string',
        required: true
    },
    description:String,
    label:String
});

const bannerModel = mongoose.model('bannerDb',bannerschema);

module.exports = bannerModel;