const { json } = require('express/lib/response');
const cartDb = require('../model/cartModel')
var ObjectId = require('mongoose').Types.ObjectId;


exports.addToCart = async(req,res)=>{
    const userId = req.session.user?._id;
    const proId = req.params.id;
    console.log("Product ID : ",proId);
    console.log("User ID : ",userId);
    let proObj={
        item:ObjectId(proId),
        quantity:1
    }
    let userCart = await cartDb.findOne({user:ObjectId(userId)})
    console.log('userCart.products : ',userCart?.products);   
    console.log('ProductId : ',ObjectId(proId));
    if (userCart) {
        let data = userCart.products
        console.log("data",data)
        let proExist = data.findIndex(product => {
            console.log(product.item, ObjectId(proId));
            let val1 = JSON.stringify(product.item)
            let val2 = JSON.stringify(ObjectId(proId))
            
            console.log('check', typeof(val1), typeof(val2), val1, val2)
            if(val1 == val2){
                    return true
                
            }else{
                return false
            }
        } )
        console.log('Product Exist in : ' ,proExist);
        if(proExist != -1){
            console.log('Im going to increment the quantity');
            const product = await cartDb.updateOne({"user":ObjectId(userId),"products.item":ObjectId(proId)},
            {
                $inc:{"products.$.quantity":1}
            }
            )
        }else{
            await cartDb.updateOne({user:ObjectId(userId)},{$push: {products:proObj}})
        }
        // 
        // await cartDb.updateOne({user:userId},{$push: {products:proId}})
    } else {
        let cartObj = new cartDb({
            user:userId,
            products:[proObj]
        })
        cartObj.save()
        console.log('Added to Cart sucessfully');
    }
    // res.send('Added to cart')
    // res.redirect('/')
    console.log('cartcontroller add to cart');
    res.json({status:true})
}





// ----------------------------- Cart Quantity --------------------------

exports.changeProductQuantity =async (req,res,next)=>{
    const cartId = req.body.cart;
    const proId = req.body.product;
    const userId = req.body.user;
    let count = req.body.count;
    let quantity = req.body.quantity;
    count = parseInt(count)
    quantity = parseInt(quantity)
    console.log(`Cart ID : ${cartId} proId : ${proId} count:${count} Quantity:${quantity} UserID: ${userId}`);
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
        console.log(totalValue);
        product.total = totalValue[0].total
        console.log(product);
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
        console.log(product);
    res.json(product)
    }
}

// --------------------- Remove from Cart -------------
exports.removeProcart =async (req,res)=>{
    const cartId = req.body.cart;
    const proId = req.body.product;
    const product = await cartDb.updateOne({_id:ObjectId(cartId)},
    {
        $pull:{products:{item:ObjectId(proId)}}
    })
    res.json(product)
}






// --------------------- Total Price --------------------

exports.getTotalAmount 


// --------------------------------------------- View Cart {User} -----------------------------------------------

exports.userCart = async(req,res)=>{
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
    console.log(totalValue[0]);
    res.render('user/cart',{cartItems,user:req.session.user,totalValue:totalValue[0]?.total})
}










