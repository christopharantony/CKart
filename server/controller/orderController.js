const productDb = require('../model/productModel')
const orderDb = require('../model/orderModel')
const userDb = require('../model/model')
const cartDb = require('../model/cartModel')
var ObjectId = require('mongoose').Types.ObjectId;

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
    console.log(orderDetails)
    res.render('user/my_orders',{orderData:orderDetails,cartCount,isUserLogin:req.session.isUserLogin})
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
        await orderDb.updateOne({_id:id},{$set: {"status":"Canceled"}})
        res.redirect('/user-orders')
    
    
}

exports.cancelOrder = async(req,res)=>{
    const id = req.params?.id;
    await orderDb.updateOne({_id:id},{$set: {"status":"Canceled"}})
    res.redirect('/admin-orders')
}

// --------------------------------------------- My Order -----------------------------------------------

exports.myOrders = async(req,res)=>{
    const userId = req.session.user?._id;
    let total = await cartDb.aggregate([
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
                total:{$sum: { $multiply: ['$quantity','$product.Price']}}
            }
        }
    ])
    console.log(total[0]?.total);
    res.render('user/place_order',{total:total[0]?.total,user:req.session.user})
}

// --------------------------------------------- Order Placing -----------------------------------------------
exports.orderPlacing = async(req,res)=>{
    console.log('REQ.BODY',req.body)
    const userId = req.body.userId
    console.log("User ID : ",req.body.userId)
    let cart = await cartDb.findOne({user:ObjectId(userId)})
    let totalPrize = await cartDb.aggregate([
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
                total:{$sum: { $multiply: ['$quantity','$product.Price']}}
            }
        }
    ])
    const order = req.body
    console.log(totalPrize);
    var total = totalPrize[0].total
    let products = cart.products

    console.log(total);
    console.log("Products here",products)

    let status = order['payment-method']==='COD'?'placed':'pending'
    let orderObj = new orderDb({
        deliveryDetails:{
            name:order.Name,
            mobile:order.mobile,
            address:order.address,
            pincode:order.Pincode
        },
        userId:ObjectId(userId),
        paymentMethod:order['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date: new Date()
    })
    console.log(products);
    orderObj.save()
    await cartDb.remove({user:ObjectId(order.userId)})
    if(req.body['payment-method']=='COD'){
        res.json({status:true})
    }else if(req.body['payment-method']=='ONLINE') {

    }else{
        res.send("Sorry,    Error in Paying...")
    }
    
    console.log('Place order post req.body',req.body)
}