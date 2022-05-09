const productDb = require('../model/productModel')
const orderDb = require('../model/orderModel')
const userDb = require('../model/model')
const cartDb = require('../model/cartModel') 

exports.dash = async(req,res)=>{
    if (req.session.isAdminLogin){
        const orders = await orderDb.find()
        const users = await userDb.find()
        const products = await productDb.find()
        const DATES = await orderDb.aggregate([
            {
                $project:{
                    date: 1,_id: 0
                }
            }
        ])
        console.log(DATES);
        const dateFormatted = DATES.map(date =>{return date.date.toDateString()})
        const uniqueDates = [...new Set(dateFormatted)];
        console.log(uniqueDates);
        const counts = []
        for (const unique of uniqueDates){
            let count = 0;
            for (const Date of dateFormatted){
                if (unique === Date) {
                    count ++
                }
            }
            counts.push(count)
        }
        console.log(counts);

        
        res.status(200).render('admin/dashboard',{counts,uniqueDates,ordercount:orders.length,usercount:users.length,productcount:products.length})
    }else{
        req.session.isAdminLogin = false;
        res.render('admin/admin_login', { error: "" });
    }
}
exports.chart = async(req, res)=>{

}
