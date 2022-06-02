const walletDb = require('../model/walletModel');
const objectId = require('mongoose').Types.ObjectId;

exports.getBalance = async (req, res) => {
    const user = req.session.user;
    const wallet = await walletDb.findOne({user:objectId(user._id)});
    console.log('user',user);
    console.log(wallet);
    res.render('user/wallet',{ user,balance:wallet?.balance });
}

exports.checkWallet = async (req, res) => {
    const user = req.session.user;
    const total = req.params.total;
    const wallet = await walletDb.findOne({user:objectId(user._id)});
    if (!wallet) {
        res.json({error:'Insufficient balance'});
    } else if (wallet.balance < total) {
        res.json({error:'Insufficient balance'});
    } else {
    res.json({status:'success'});
    }
}