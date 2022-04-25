const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDb'
    },
    products: Array
});

const categoryModel = mongoose.model('cartDb',cartSchema);

module.exports = categoryModel;