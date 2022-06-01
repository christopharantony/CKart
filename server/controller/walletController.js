const walletDb = require('../model/walletModel');
const objectId = require('mongoose').Types.ObjectId;

exports.removeBalance = async (req, res) => {
    const user = req.session.user;
    const balance = req.body.balance;
    const wallet = await walletDb.findOne({user:user._id});
    if (wallet.balance >= balance) {
        wallet.balance -= parseInt(balance);
        await wallet.save();
        res.json({balance:wallet.balance});
    }
    else{
        res.json({error:'Insufficient balance'});
    }
}

exports.getBalance = async (req, res) => {
    const user = req.session.user;
    const wallet = await walletDb.findOne({user:objectId(user._id)});
    console.log('user',user);
    console.log(wallet);
    res.render('user/wallet',{ user,balance:wallet?.balance });
}