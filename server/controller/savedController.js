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
    const alreadySaved = await savedAddressDb.findOne(saveObj)
    const address = new savedAddressDb(saveObj);
    if (alreadySaved) {
        res.json({error:'Already saved'})
    }
    else{
        await address.save();
        res.json({address:`New address :${saveObj.address}`});
    }
}

// const validate = (data) => {
//     const schema = Joi.object({
//         user:Joi.allow(),
//         name:Joi.string().min(4).pattern(/^[A-Za-z][A-Za-z ]*$/).label('Name'),
//         phone:Joi.string().min(10).max(12).pattern(/^[0-9]+$/).required().label("Mobile number"),
//         pincode:Joi.string().length(6).pattern(/^[0-9]+$/).required().label("Pincode"),
//         address:Joi.string().min(7).required()
//     })
//     return schema.validate(data)
// }