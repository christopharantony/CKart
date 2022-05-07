const mongoose = require('mongoose')

const favSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDb'
    },
    products: Array
});

const favModel = mongoose.model('favDb',favSchema);

module.exports = favModel;