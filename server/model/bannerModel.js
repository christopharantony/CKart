const mongoose = require('mongoose');

const bannerschema = new mongoose.Schema({
    image:String,
    description:String 
});

const bannerModel = mongoose.model('bannerDb',bannerschema);

module.exports = bannerModel;