const mongoose = require('mongoose');

const categoryschema = new mongoose.Schema({
    name:String
});

const categoryModel = mongoose.model('categoryDb')