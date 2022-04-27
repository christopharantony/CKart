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

exports.getProductQuantity = (req,res,next)=>{
    console.log(req.body);
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