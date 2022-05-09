const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    percentage:{
        type: Number,
        required: true
    },
    proId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'productDb'
    },
    fromDate:{
        type: Date,
        required: true
    },
    toDate:{
        type: Date,
        required: true
    },
    status:{
        type: Boolean,
        default: true
    }
})

const offerModel = mongoose.model('offerdb',offerSchema);

module.exports = offerModel;