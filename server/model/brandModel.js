const mongoose = require('mongoose');

const brandschema = new mongoose.Schema({
    name:String,
    category :{ type: mongoose.Schema.Types.ObjectId, ref: 'categoryDb'}
});

const brandModel = mongoose.model('brandDb',brandschema);

module.exports = brandModel;