var ObjectId = require('mongoose').Types.ObjectId;
const productDb = require('../model/productModel')
const orderDb = require('../model/orderModel')
const cartDb = require('../model/cartModel')
const userDb = require('../model/model')
const crypto = require('crypto');
const Joi = require('joi');


const Razorpay = require('razorpay');
const { string } = require('joi');
var instance = new Razorpay({
    key_id: 'rzp_test_GHZ8qfO5RgHRDG',
    key_secret: '96OZZd2cbBqVjnR6ZLeQrGOU',
    });

// --------------------------------------------- My Orders -----------------------------------------------
exports.Find = async (req,res)=>{
    const userId = req.session.user?._id
    const orderDetails = await orderDb.aggregate([
        {
            $match:{
                userId:ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:'userdbs',
                localField:'userId',
                foreignField:'_id',
                as:'userData'
            }
        },
        {
            $unwind:"$products"
        },
        {
            $lookup:{
                from:'productdbs',
                localField:'products.item',
                foreignField:'_id',
                as:'productData'
            }
        }
    ]) 
    let cartCount = 0
            let cart = await cartDb.findOne({user:req.session.user._id})
            console.log('cart',cart);
            if (cart) {
                cartCount = cart.products.length
            }
    console.log("Error finding in My orders",orderDetails[0])
    res.render('user/my_orders',{orderDatas:orderDetails,cartCount,isUserLogin:req.session.isUserLogin})
}
// --------------------------------------------- Orders in admin side -----------------------------------------------
exports.find = async (req,res)=>{
    const orderDetails = await orderDb.aggregate([
        
        {
            $lookup:{
                from:'userdbs',
                localField:'userId',
                foreignField:'_id',
                as:'userData'
            }
        },
        {
            $unwind:"$products"
        },
        {
            $lookup:{
                from:'productdbs',
                localField:'products.item',
                foreignField:'_id',
                as:'productData'
            }
        }
    ])
    console.log(orderDetails);
    console.log('productData',orderDetails[0].productData);
    console.log('usertData',orderDetails[0].userData);
    res.render('admin/admin_orders',{orderData:orderDetails})
}

exports.statusUpdate = async(req, res) => {
    let status = req.body.status;
    let orderId = req.body.orderId
    console.log(`status : ${status} orderId: ${orderId}`);
    await orderDb.updateOne({_id:ObjectId(orderId)},
    {
        $set: {status:status}
    })
    res.json(true);
}

// --------------------------------------------------------------- Cancel Orders  ---------------------------------------------------------

exports.cancel = async(req,res)=>{
        const id = req.params.id;
        const order = await orderDb.findOne({_id:ObjectId(id)})
        const proId = order.products[0].item
        await productDb.updateOne({"_id": ObjectId(proId)},
        {
            $inc: { Quantity : 1 }
        })
        await orderDb.updateOne({_id:id},{$set: {"status":"Canceled"}})
        res.redirect('/user-orders')
}

exports.cancelOrder = async(req,res)=>{
    const id = req.params?.id;
    const order = await orderDb.findOne({_id:ObjectId(id)})
    const proId = order.products[0].item
    await orderDb.updateOne({_id:id},{$set: {"status":"Canceled"}})
    await productDb.updateOne({"_id": ObjectId(proId)},
    {
        $inc: { Quantity : 1 }
    })
    res.redirect('/admin-orders')
}

// --------------------------------------------- My Order -----------------------------------------------
exports.myOrders = async(req,res)=>{
    const userId = req.session.user?._id;

    let offerPrice = await cartDb.aggregate([
        {
            $match:{user:ObjectId(userId)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:'offerdbs',
                localField:'item',
                foreignField:'proId',
                as:'offerCart'
            }
        },
        {
            $unwind: '$offerCart'
        },
        {
            $project:{
                percentage:'$offerCart.percentage',
                status:'$offerCart.status',
                proId:'$item',
                quantity: 1
            }
        },
        {
            $lookup:{
                from: 'productdbs',
                localField:'proId',
                foreignField:'_id',
                as:'products'
            }
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                percentage: 1,
                status: 1,
                proId: 1,
                quantity: 1,
                offerPrice:{ $divide: [{$multiply: ['$quantity','$products.Price','$percentage']},100 ]},
                productPrice: {$multiply: ['$products.Price', '$quantity'] },
                // saving:{ $subtract: [ '$products.Price', { $divide: [{$multiply: ['$products.Price','$quantity','$percentage']},100 ]} ] }
            }
        },

    ])
    let totalValue = await cartDb.aggregate([
        {
            $match:{user:ObjectId(userId)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:'productdbs',
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
        },
        {
            $project:{
                item: 1, quantity: 1 ,product: { $arrayElemAt: ['$product',0]}
            }
        },
        {
            $group:{
                _id:null,
                total:{$sum: { $multiply: ['$quantity','$product.Price']}},
                totalCount:{$sum: '$quantity'}
            }
        }
    ])
    console.log(totalValue);
    console.log("OoooooferPrice",offerPrice);
    const totalOffer = offerPrice.map(data => data.offerPrice).reduce((total, save)=>{
        return total + save;
    },0)
    // const normalPrice = offerPrice.map(data => data.productPrice).reduce((normal, save)=>{
    //     return normal + save;
    // },0)
    const total = totalValue[0].total - totalOffer;
    console.log(`Total : ${total} Normal Price : ${totalValue[0].total} totalOffer : ${totalOffer}`);
    
    res.render('user/place_order',{error:"",total,user:req.session.user})
}

// --------------------------------------------- Buy now  -----------------------------------------------
exports.buynow = async (req, res)=>{
    const userId = req.body.userId
    const proId = req.body.proId
    const total = parseInt(req.params.price);

    let products = [{item:ObjectId(proId),quantity: 1}]
    const order = req.body
    // let status = req.body['payment-method']==='COD'?'placed':'pending'
    let status = 'pending'
    let deliveryDetails = {
        name:order.Name,
        mobile:order.mobile,
        address:order.address,
        pincode:order.Pincode
    }
    const { error } = validate(deliveryDetails)
    if (error){
        // return res.render('user/place_order',{error: error.details[0].message,user:userId,total})
        res.json({error: error.details[0].message,user:userId,total:total})
    }else{
    let orderObj = new orderDb({
        deliveryDetails:deliveryDetails,
        userId:ObjectId(userId),
        paymentMethod:req.body['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date: new Date()
    })
    orderObj.save()
    await productDb.updateOne({"_id": ObjectId(proId)},
    {
        $inc: { Quantity : -1 }
    })
    if(req.body['payment-method']=='COD'){
        res.json({codSuccess:true})
    }else{
        console.log(`total : ${total} Product : ${products[0].item}`)
        var options = {
            amount: total*100,
            currency: "INR",
            receipt: ""+products[0].item,
            notes: {
                key1: "value3",
                key2: "value2"
            }
        }
        instance.orders.create(options, function(err, order) {
            if (err) {
                console.log('error',err);
            }else {
                console.log("New Order",order);
                res.json(order);
            }
        })
    }
    }
}





// --------------------------------------------- Order Placing -----------------------------------------------
exports.orderPlacing = async(req,res)=>{
    const userId = req.body.userId
    console.log(userId);
    let cart = await cartDb.findOne({user:ObjectId(userId)})
    let offerPrice = await cartDb.aggregate([
        {
            $match:{user:ObjectId(userId)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:'offerdbs',
                localField:'item',
                foreignField:'proId',
                as:'offerCart'
            }
        },
        {
            $unwind: '$offerCart'
        },
        {
            $project:{
                percentage:'$offerCart.percentage',
                status:'$offerCart.status',
                proId:'$item',
                quantity: 1
            }
        },
        {
            $lookup:{
                from: 'productdbs',
                localField:'proId',
                foreignField:'_id',
                as:'products'
            }
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                percentage: 1,
                status: 1,
                proId: 1,
                quantity: 1,
                offerPrice:{ $divide: [{$multiply: ['$quantity','$products.Price','$percentage']},100 ]},
                productPrice: {$multiply: ['$products.Price', '$quantity'] },
                // saving:{ $subtract: [ '$products.Price', { $divide: [{$multiply: ['$products.Price','$quantity','$percentage']},100 ]} ] }
            }
        },

    ])
    let totalValue = await cartDb.aggregate([
        {
            $match:{user:ObjectId(userId)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:'productdbs',
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
        },
        {
            $project:{
                item: 1, quantity: 1 ,product: { $arrayElemAt: ['$product',0]}
            }
        },
        {
            $group:{
                _id:null,
                total:{$sum: { $multiply: ['$quantity','$product.Price']}},
                totalCount:{$sum: '$quantity'}
            }
        }
    ])
    console.log("OoooooferPrice",offerPrice);
    const totalOffer = offerPrice.map(data => data.offerPrice).reduce((total, save)=>{
        return total + save;
    },0)
    const order = req.body
    const total = totalValue[0].total - totalOffer;
    let products = cart.products
    let deliveryDetails = {
        name:order.Name,
        mobile:order.mobile,
        address:order.address,
        pincode:order.Pincode
    }
    // const { error } = validate(deliveryDetails) 
    // if (error){
        // return res.render('user/place_order',{error: error.details[0].message,user:userId,total})
        // res.json({error: error.details[0].message,user:userId,total:total})
    // }else{
    let status = order['payment-method']==='COD'?'placed':'pending'
    let orderObj = new orderDb({
        deliveryDetails:deliveryDetails,
        userId:ObjectId(userId),
        paymentMethod:order['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date: new Date()
    })
        orderObj.save()
        await productDb.updateOne({"_id": ObjectId(products[0].item)},
        {
            $inc: { Quantity : -products[0].quantity }
        })
        await cartDb.deleteOne({user:ObjectId(order.userId)})
        if(req.body['payment-method']=='COD'){
            res.json({codSuccess:true})
        }
        else if(req.body['payment-method']=='ONLINE') {
            // }
            // else{
                var options = {
                    amount: total*100,
                    currency: "INR",
                    receipt: ""+products[0].item,
                    // notes: {
                        //     key1: "value3",
                        //     key2: "value2"
                        // }
                    }
                    instance.orders.create(options, function(err, order) {
                        if (err) {
                            console.log(err);
                        }else {
                            console.log("New Order",order);
                            res.json(order);
                        }
                    })
                }
            // }
}
// --------------------------------------------- Payment Verification -----------------------------------------------
exports.paymentVerification = async(req, res)=>{
    let hmac = crypto.createHmac('sha256', '96OZZd2cbBqVjnR6ZLeQrGOU');
    hmac.update(req.body.payment.razorpay_order_id+'|'+req.body.payment.razorpay_payment_id);
    hmac = hmac.digest('hex')
if(hmac==req.body.payment.razorpay_signature){
    // userHelpers.chagePaymentStatus (req.body [' receipt']).then(() =>{
    //     console.log("Payment successfull"); 
    //     res.json({status:true})
    const orderId = req.body.order.receipt
    await orderDb.updateOne({_id:ObjectId(orderId)},
    {
        $set:{ status:'pending'}
    })
    console.log('payment successfull');
    res.json({status:true})
}else{
    console.log(err);
    res.json({status: false,errMsg:''})
}
}
    const validate = (data) => {
        const schema = Joi.object({
            name: Joi.string().required().label("Name"),
            mobile:Joi.string().length(10).pattern(/^[0-9]+$/).required().label("Mobile number"),
            address: Joi.string().required().min(10).label("Address"),
            pincode:Joi.string().length(6).pattern(/^[0-9]+$/).required().label("Pincode"),
        })
        return schema.validate(data)
    }