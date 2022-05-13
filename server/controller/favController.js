const favDb = require('../model/favModel');
var ObjectId = require('mongoose').Types.ObjectId;

// Add to Favorites
exports.fav = async (req,res)=>{
    const userId = req.session.user?._id;
    const proId = req.params.id;
    let favList = await favDb.findOne({user:ObjectId(userId)})
    if (favList) {
        let data = favList.products
        let proExist = data.findIndex(product => {
            let val1 = JSON.stringify(product)
            let val2 = JSON.stringify(ObjectId(proId))
            if(val1 == val2){
                return true
            
            }else{
                return false
            }
        })
        if(proExist != -1){
            console.log('Removed from Wishlist');
            await favDb.updateOne({"user":ObjectId(userId)},{$pull: {"products":ObjectId(proId)}})
            res.json({status:false})
        }else{
            console.log('Added to Wishlist');
            await favDb.updateOne({user:ObjectId(userId)},{$push: {products:ObjectId(proId)}})
            res.json({status:true})
        }
    } else {
        let favObj = new favDb({
            user:userId,
            products:[ObjectId(proId)]
        })
        favObj.save()
        console.log("Added to Wishlist");
        res.json({status:true})
    }
}

exports.find = async (req, res)=>{
    const userId = req.session.user?._id;
    let wishlist = await favDb.aggregate([
        {
            $match:{user:ObjectId(userId)}
        },
        {
            $unwind:'$products'
        },
        {
            $lookup:{
                from:'productdbs',
                localField:'products',
                foreignField:'_id',
                as:'product'
            }
        },
        {
            $project:{
                product: 1
            }
        }
    ])
    res.render('user/fav',{cartItems:wishlist,user:req.session.user})
}

// --------------------- Remove from Wishlist -------------------
exports.removeProfav =async (req,res)=>{
    const favId = req.body.cart;
    const proId = req.body.product;
    const product = await favDb.updateOne({_id:ObjectId(favId)},
    {
        $pull:{products:ObjectId(proId)}
    })
    res.json(product)
}