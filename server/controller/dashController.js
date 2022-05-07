const productDb = require('../model/productModel')
const orderDb = require('../model/orderModel')
const userDb = require('../model/model')
const cartDb = require('../model/cartModel') 

exports.dash = async(req,res)=>{
    if (req.session.isAdminLogin){
        const orders = await orderDb.find()
        const users = await userDb.find()
        const products = await productDb.find()
        console.log("No. of orders found : ",orders.length)
        console.log("No. of users found : ",users.length)
        console.log("No. of products found : ",products.length)
        res.status(200).render('admin/dashboard',{ordercount:orders.length,usercount:users.length,productcount:products.length})
    }else{
        req.session.isAdminLogin = false;
        res.render('admin/admin_login', { error: "" });
    }
}
exports.chart = async(req, res)=>{

}
