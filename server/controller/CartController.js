const { json } = require('express/lib/response');
const cartDb = require('../model/cartModel')
var ObjectId = require('mongoose').Types.ObjectId;

exports.addToCart = async(req,res)=>{
    const userId = req.session.user?._id;
    const proId = req.params.id;
    let proObj={
        item:ObjectId(proId),
        quantity:1
    }
    let userCart = await cartDb.findOne({user:ObjectId(userId)})
    if (userCart) {
        let data = userCart.products
        let proExist = data.findIndex(product => {
            let val1 = JSON.stringify(product.item)
            let val2 = JSON.stringify(ObjectId(proId))
            if(val1 == val2){
                    return true
                
            }else{
                return false
            }
        } )
        if(proExist != -1){
            await cartDb.updateOne({"user":ObjectId(userId),"products.item":ObjectId(proId)},
            {
                $inc:{"products.$.quantity":1}
            }
            )
        }else{
            await cartDb.updateOne({user:ObjectId(userId)},{$push: {products:proObj}})
        }
    } else {
        let cartObj = new cartDb({
            user:userId,
            products:[proObj]
        })
        cartObj.save()
    }
    res.json({status:true})
}

exports.changeProductQuantity =async (req,res,next)=>{
    const cartId = req.body.cart;
    const proId = req.body.product;
    const userId = req.body.user;
    let count = req.body.count;
    let quantity = req.body.quantity;
    count = parseInt(count)
    quantity = parseInt(quantity)
    if ( count == -1 && quantity == 1) {
        let product = await cartDb.updateOne({_id:ObjectId(cartId)},
        {
            $pull:{products:{item:ObjectId(proId)}}
        })
        product.removeProduct = true;
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
                    total:{$sum: { $multiply: ['$quantity','$product.Price']}}
                }
            }
        ])
        product.total = totalValue[0]?.total
    res.json(product)
    }else{
        const userId = req.body.user
        const product = await cartDb.updateOne({_id:ObjectId(cartId),"products.item":ObjectId(proId)},
        {
            $inc:{"products.$.quantity":count}
        })
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
                    total:{$sum: { $multiply: ['$quantity','$product.Price']}}
                }
            }
        ])
        product.total = totalValue[0].total
    res.json(product)
    }
}

exports.removeProcart =async (req,res)=>{
    const cartId = req.body.cart;
    const proId = req.body.product;
    const product = await cartDb.updateOne({_id:ObjectId(cartId)},
    {
        $pull:{products:{item:ObjectId(proId)}}
    })
    res.json(product)
}

// --------------------------------------------- View Cart -----------------------------------------------
exports.userCart = async(req,res)=>{
    try {
        const userId = req.session.user?._id;
        let cartItems = await cartDb.aggregate([
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
        }
    ])
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
                // saving:{ $subtract: [ '$products.Price', { $divide: [{$multiply: ['$products.Price','$quantity','$percentage']},100 ]} ] }
            }
        },

    ])
    const saving = offerPrice.map(data => data.saving).reduce((total, save)=>{
        return total + save;
    },0)
    const totalOffer = offerPrice.map(data => data.offerPrice).reduce((total, save)=>{
        return total + save;
    },0)
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
    let totalNo = 0
    for (const cart of cartItems) {
        totalNo = cart.quantity + totalNo;
    }
    const save = (totalValue[0]?.total) - totalOffer;
    res.render('user/cart',{save,totalOffer,cartItems,totalNo,user:req.session.user,totalValue:totalValue[0]?.total})
} catch (error) {
    console.log(error)
    res.status(400).send("Error"+error.message)
}
}