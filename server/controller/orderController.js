var ObjectId = require('mongoose').Types.ObjectId;
const savedAddressDb = require('../model/savedAddressModel')
const productDb = require('../model/productModel')
const walletDb = require('../model/walletModel')
const offerDb = require('../model/offerModel')
const orderDb = require('../model/orderModel')
const cartDb = require('../model/cartModel')
const userDb = require('../model/model')
const crypto = require('crypto');

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
            let cart = await cartDb.findOne({user:req.session.user?._id})
            console.log('cart',cart);
            if (cart) {
                cartCount = cart.products.length
            }
    res.render('user/my_orders',{orderDatas:orderDetails,cartCount,isUserLogin:req.session.isUserLogin})
}
// ------------------------------------------ Orders in admin side ----------------------------------------
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
        const user = req.session.user;
        const order = await orderDb.findOne({_id:ObjectId(id)})
        const balance = order.totalAmount;
        const wallet = await walletDb.findOne({user:user._id});
        if (wallet){
            wallet.user = user._id,
            wallet.balance += parseInt(balance);
            await wallet.save();
        }else{
            const wallet = new walletDb({
                user:user._id,
                balance:parseInt(balance)
            })            
            await wallet.save();
        }
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
    res.redirect('/admin/admin-orders')
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
            $match:{
                status:true
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
    const totalOffer = offerPrice.map(data => data.offerPrice).reduce((total, save)=>{
        return total + save;
    },0)
    const total = totalValue[0].total - totalOffer;
    const address = await savedAddressDb.find({user:req.session.user._id}).sort({date: -1}).limit(3)
    res.render('user/place_order',{address,error:"",total,user:req.session.user})
}

// --------------------------------------------- Buy now  -----------------------------------------------
exports.buynowPage = async (req, res)=>{
    const user = req.session.user;
    const product = req.query.id;
    const pro = await productDb.findById(product)
    const address = await savedAddressDb.find({user:user._id}).sort({date: -1}).limit(3)
    const offer = await offerDb.findOne({proId:product,status:true})
    if (offer) {
        var total = pro.Price - ( ( pro.Price * offer.percentage ) / 100 )
    }else{
        var total = pro.Price
    }
    res.render('user/buyplace_order',{total,user,product,address})
}

exports.buynow = async (req, res)=>{
    const userId = req.body.userId;
    const proId = req.body.proId;
    const total = parseInt(req.params.price);
    let products = [{item:ObjectId(proId),quantity: 1}]
    const order = req.body;
    let status = 'pending'
    let deliveryDetails = {
        name:order.Name,
        mobile:order.mobile,
        address:order.address,
        pincode:order.Pincode
    };
    req.session.address = deliveryDetails;
    req.session.products = [proId]
    let orderObject = {
        deliveryDetails:deliveryDetails,
        userId:ObjectId(userId),
        paymentMethod:req.body['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date: new Date()
    }
    let orderObj = new orderDb(orderObject);
    orderObj.save();
    req.session.orderDate = orderObject.date;
    await productDb.updateOne({"_id": ObjectId(proId)},
    {
        $inc: { Quantity : -1 }
    });
    if (req.body['payment-method'] == 'WALLET'){
            await walletDb.updateOne({user:ObjectId(userId)},{$inc: { balance: -total }})
            res.json({codSuccess:true,address:deliveryDetails})
    }else if(req.body['payment-method']=='COD'){
        res.json({codSuccess:true,address:deliveryDetails})
    }else if(req.body['payment-method']=='ONLINE'){
        await orderDb.updateOne({date:req.session.orderDate}, { $set: {status:'Failed'} })
        var options = {
            amount: total*100,
            currency: "INR",
            receipt: products[0].item.toString(),
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

// --------------------------------------------- Order Placing -----------------------------------------------
exports.orderPlacing = async(req,res)=>{
    const userId = req.body.userId
    let cart = await cartDb.findOne({user:ObjectId(userId)});
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
            $match:{
                status:true
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
            }
        },
    ]);

    let totalValue = parseInt(req.params.price);

    const totalOffer = offerPrice.map(data => data.offerPrice).reduce((total, save)=>{
        return total + save;
    },0)
    const order = req.body
    const total = totalValue - totalOffer;
    console.log(total);
    let products = cart?.products
    let deliveryDetails = {
        name:order.Name,
        mobile:order.mobile,
        address:order.address,
        pincode:order.Pincode
    }
    req.session.address = deliveryDetails;
    
    const proIds = await cartDb.aggregate([
        {
            $match:{user:ObjectId(userId)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{_id:0,Id:'$products.item'}
        }
        ])
        const productIds = [];
        for (const proId of proIds){
            productIds.push(proId.Id)
        }
    req.session.products = productIds;

    let status = 'pending';

    let orderObject = {
        deliveryDetails:deliveryDetails,
        userId:ObjectId(userId),
        paymentMethod:order['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date: new Date()
    }
    let orderObj = new orderDb(orderObject);
    await orderObj.save(); 
    req.session.orderDate = orderObject.date;
        await productDb.updateOne({"_id": ObjectId(products[0].item)},
        {
            $inc: { Quantity : -products[0].quantity }
        })
        await cartDb.deleteOne({user:ObjectId(order.userId)})
        if (req.body['payment-method'] == 'WALLET'){
            await walletDb.updateOne({user:ObjectId(userId)},{$inc: { balance: -total }})
            res.json({codSuccess:true,address:deliveryDetails})
        }else if(req.body['payment-method']=='COD'){
            res.json({codSuccess:true})  
        }
        else if(req.body['payment-method']=='ONLINE') {
            await orderDb.updateOne({date:req.session.orderDate}, { $set: {status:'Failed'} })
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
                            res.send(err.message);
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
    // const orderId = req.body.order.receipt
    // await orderDb.updateOne({_id:ObjectId(orderId)},
    // {
    //     $set:{ status:'pending'}
    // })
    res.json({status:true})
}else{
    console.log(err);
    res.json({status: false,errMsg:''})
}
}
