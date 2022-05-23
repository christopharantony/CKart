const Joi = require('joi');
const savedAddressDb = require('../model/savedAddressModel')

exports.saveAddress = async (req, res)=>{
    console.log('req.params.address',req.params.address);
    console.log('req.session.user._id',req.session.user._id);
    const alreadySaved = await savedAddressDb.findOne({address:req.params.address})
    const savedObj = {
        user:req.session.user._id,
        address:req.params.address
    }
    const address = new savedAddressDb(savedObj);
    const { error } = validate(savedObj);
    console.log('ERROR',error);
    console.log("Already exist",alreadySaved);
    console.log('Address : ',savedObj.address);
    if (error) {
        res.json({error:'Enter a valid Address'});
    }else if (alreadySaved) {
        res.json({error:'Already saved'})
    }
    else{
        await address.save();
        res.json({address:`New address :${savedObj.address}`});
    }
}

const validate = (data) => {
    const schema = Joi.object({
        user:Joi.allow(),
        address:Joi.string().min(7).required()
    })
    return schema.validate(data)
}