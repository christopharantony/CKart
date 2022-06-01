// const Joi = require('joi');
const savedAddressDb = require('../model/savedAddressModel')

exports.saveAddress = async (req, res)=>{
    const saveObj = {
        user:req.session.user._id,
        name:req.body.name,
        phone:req.body.mobile,
        pincode:req.body.pin,
        address:req.body.address,
        date:Date.now()
    }
    const checkObj = {
        user:req.session.user._id,
        name:req.body.name,
        phone:req.body.mobile,
        pincode:req.body.pin,
        address:req.body.address
    }
    const alreadySaved = await savedAddressDb.findOne(checkObj)
    const address = new savedAddressDb(saveObj);
    if (alreadySaved) {
        res.json({error:'Already saved'})
    }
    else{
        await address.save();
        res.json({address:`New address :${saveObj.address}`});
    }
}