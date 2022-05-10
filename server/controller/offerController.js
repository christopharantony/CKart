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
        res.render('admin/offer_add',{pros})
    }catch(e){
        console.log(e);
        res.send("Can't load Add Offers page")
    }
}

exports.addOffer = async(req, res) => {
    try{
        const offer = new offerDb({
            proId:req.body.product,
            percentage:req.body.percentage,
            fromDate:req.body.fromDate,
            toDate:req.body.toDate
        })
        await offer.save()
        res.redirect('/offer')
    }catch(e){
        console.log(e);
        res.send("Can't add this offer'")
    }
}