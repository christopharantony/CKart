const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDb'
    },
    balance: Number,
});

const walletModel = mongoose.model('walletDb', walletSchema);

module.exports = walletModel;