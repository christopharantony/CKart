const { json } = require('express/lib/response');
const cartDb = require('../model/cartModel')
var ObjectId = require('mongoose').Types.ObjectId;


exports.addToCart = async(req,res)=>{
    const userId = req.session.user._id;
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
                    console.log('found')
                    return true
                
            }else{
                console.log('not found')
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
            console.log(product);
        }else{
            console.log('Not incrementing')
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
    let count = req.body.count;
    let quantity = req.body.quantity;
    count = parseInt(count)
    quantity = parseInt(quantity)
    console.log(`Cart ID : ${cartId} proId : ${proId} count:${count} Quantity:${quantity}`);
    if ( count == -1 && quantity == 1) {
        const product = await cartDb.updateOne({_id:ObjectId(cartId)},
        {
            $pull:{products:{item:ObjectId(proId)}}
        })
        product.removeProduct = true;
        console.log(product);
    res.json(product)
    }else{
        const product = await cartDb.updateOne({_id:ObjectId(cartId),"products.item":ObjectId(proId)},
        {
            $inc:{"products.$.quantity":count}
        })
        console.log(product);
    res.json(product)
    }
    
    // console.log(product);
    // res.json(product)
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







// 
// var ObjectId = require('mongoose').Types.ObjectId; 


// exports.addToCart = async (req,res)=>{
//     const proId = req.params.id;
//     const userId = req.session.user._id;
//     let userCart = await cartDb.findOne({user:ObjectId(userId)})
//     if (userCart) {
//         res.send('Hai')
//     } else {
//         let cartObj = new cartDb({
//             user:ObjectId(userId),
//             products:[ObjectId(proId)]
//         });
//         cartObj.save()
//         res.send('Hai')
//     }

// }