const Joi = require('joi');
const couponDb = require('../model/couponModel')

exports.showcoupons = async (req,res)=>{
    try {
        const coupon = await couponDb.find();
        res.render('admin/coupon',{coupon})
    } catch (error) {
        console.log(error);
        res.send("Error in show coupon: ",error.message);
    }
}

exports.status = async (req, res)=>{
    try {
        const coupon = await couponDb.findById(req.params.id);
        if (coupon.status){
            await couponDb.findByIdAndUpdate(req.params.id,{status:false})
        }else{
            await couponDb.findByIdAndUpdate(req.params.id,{status:true})
        }
        res.redirect('/coupon')
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
}

exports.adding = async (req,res)=>{
    try {
        res.render('admin/coupon_add',{error:''})
    }catch (error) {
        console.log(error);
        res.send("Error in Coupon add page: ",error.message);
    }
}

exports.addCoupon = async (req,res)=>{
    try{
        const couponObj = {
            Code: req.body.Code,
            percentage:req.body.percentage,
            min:req.body.min,
            fromDate:req.body.fromDate,
            toDate:req.body.toDate
        }
        const coupon = new couponDb(couponObj);
        const { error } = validate(couponObj);
        if (error) {
            req.session.error = error.details[0].message
            res.redirect('/couponAddErr')
        }else{
            await coupon.save()
            res.redirect('/coupon')
        }
    }catch (error) {
        console.log(error);
        res.send("Error in adding: ",error.message);
    }
}

exports.editCoupon = async(req, res) => {
    try {
        const coupon = await couponDb.findOne({_id:req.params.id});
        res.render('admin/coupon_update',{coupon,error:""})
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

exports.update = async(req, res) =>{
    try{
        const id = req.params.id;
        const couponObj = {
            Code:req.body.Code,
            percentage:req.body.percentage,
            min:req.body.min,
            fromDate:req.body.fromDate,
            toDate:req.body.toDate
        }
        const { error } = validate(couponObj);
        if (error) {
            req.session.couponId = id;
            req.session.error = error.details[0].message;
            res.redirect('/couponEditErr')
        }else{
            await couponDb.updateOne({_id:id},{$set: couponObj})
            res.redirect('/coupon')
        }
    }catch (error) {
        console.log(error);
        res.status(400).send(error.message)
    }
}

exports.delete = (req, res) =>{
    const id = req.params.id;
    couponDb.findByIdAndDelete(id).then(()=>{
        res.redirect('/coupon')
    })
}

exports.applyCoupon = async(req, res)=>{
    console.log('Bodyyyyyyyyyyyy',req.params)
    const code = req.params.coupon;
    const total = parseInt(req.params.total);
    const discount = await couponDb.findOne({Code:code,status:true})
    if (discount) {
        console.log(discount.min);
        console.log(total);
        if (discount.min < total) {
            console.log(discount.percentage);
            const couponPrice = total - ((total*discount.percentage)/100);
            res.json({couponPrice: couponPrice})
        }else{
            res.json({error:`Minimum $ ${discount.min} spend`})
        }
    }else{
        res.json({error:'Invalid Code'})
    }
}

const validate = (data) => {
    const schema = Joi.object({
        Code: Joi.string().min(3).max(30).required().label("Coupon code"),
        percentage: Joi.number().max(100).required().label("Percentage"),
        min: Joi.number().required().label("Minimum Prize"),
        fromDate: Joi.date().required().label("From date"),
        toDate: Joi.date().required().label("To date")
    })
    return schema.validate(data)
}