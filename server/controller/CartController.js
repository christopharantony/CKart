const cartDb = require('../model/cartModel')
var ObjectId = require('mongoose').Types.ObjectId;


exports.addToCart = async(req,res)=>{
    console.log("Product ID : ",req.query.id);
    console.log("User ID : ",req.session.user._id)
    const proId = req.query.id;
    const userId = req.session.user._id;
    let userCart = await cartDb.findOne({user:ObjectId(userId)})
    if (userCart) {
        await cartDb.updateOne({user:ObjectId(userId)},{$push: {products:ObjectId(proId)}})
    } else {
        let cartObj = new cartDb({
            user:ObjectId(userId),
            products:[ObjectId(proId)]
        })
        cartObj.save()
        console.log('Added to Cart sucessfully');
    }
    res.send('Added to cart')
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