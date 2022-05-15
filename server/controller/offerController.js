const Joi = require('joi');
const offerDb = require('../model/offerModel')
const productDb = require('../model/productModel')
const objectId = require('mongoose').Types.ObjectId

exports.showOffer = async(req,res)=>{
    try{
        const offer = await offerDb.aggregate([
            {
                $lookup:{
                    from:'productdbs',
                    localField:'proId',
                    foreignField:'_id',
                    as:'product'
                }
            }
        ])
        console.log(offer);
        console.log(offer[0].product)
        res.render('admin/offer',{offer})
    }catch(e){
        console.log(e);
        res.status(404).send("Can't show the offers")
    }
}

exports.adding = async(req, res) => {
    try{
        const pros = await productDb.find()
        res.render('admin/offer_add',{pros,error:""})
    }catch(e){
        console.log(e);
        res.send("Can't load Add Offers page")
    }
}

exports.addOffer = async(req, res) => {
    try{
        const offerObj = {
            proId:req.body.product,
            percentage:req.body.percentage,
            fromDate:req.body.fromDate,
            toDate:req.body.toDate
        }
        const offer = new offerDb(offerObj);
        const { error } = validate(offerObj);
        if (error) {
            req.session.error = error.details[0].message
            res.redirect('/offerAddErr')
        }else{
            await offer.save()
            res.redirect('/offer')
        }
    }catch(e){
        console.log(e);
        res.send("Can't add this offer",e.message)
    }
}

exports.editOffer = async(req, res)=>{
    try {
        const pros = await productDb.find()
        const offer = await offerDb.findOne({_id:req.params.id})
        console.log(offer,pros);
        res.render('admin/offer_update',{pros,offer,error:""})
    } catch (error) {
        console.log(error);
        res.send("Error in loading offer edit"+error.message)
    }
}

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const offerObj = {
            proId:req.body.product,
            percentage:req.body.percentage,
            fromDate:req.body.fromDate,
            toDate:req.body.toDate
        }
        const { error } = validate(offerObj);
        if (error) {
            req.session.error = error.details[0].message
            res.redirect('/offerEditErr')
        }else{
            await offerDb.updateOne({_id:id},{$set: offerObj});
            res.redirect('/offer')
        }
    }catch (error) {
        console.log(error);
        res.send("Error updating offer"+error.message)
    }
}

exports.delete = (req, res)=>{
    const id = req.params.id
    offerDb.findByIdAndDelete(id).then(()=>{
        res.redirect('/offer')
    })
}

const validate = (data) => {
    const schema = Joi.object({
        proId: Joi.allow(),
        percentage: Joi.number().max(100).required().label("Percentage"),
        fromDate: Joi.date().required().label("From date"),
        toDate: Joi.date().required().label("To date")
    })
    return schema.validate(data)
}