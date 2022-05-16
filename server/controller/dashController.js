const productDb = require('../model/productModel')
const categoryDb = require('../model/categoryModel')
const orderDb = require('../model/orderModel')
const userDb = require('../model/model')
const cartDb = require('../model/cartModel') 

exports.dash = async(req,res)=>{
    if (req.session.isAdminLogin){
        const orders = await orderDb.find()
        // const users = await userDb.find()
        const products = await productDb.find()
        const USERS =await userDb.aggregate([
            {
                $project:{
                    _id:0,isBlocked:1
                }
            }
        ])
        let blockedCount = 0
        let activeCount = 0
        for (const user of USERS) {
            user.isBlocked?blockedCount++:activeCount++
        }
        const DATES = await orderDb.aggregate([
            {
                $project:{
                    date: 1,_id: 0
                }
            }
        ])
        const dateFormatted = DATES.map(date =>{return date.date.toDateString()})
        const uniqueDates = [...new Set(dateFormatted)];
        const Days = uniqueDates.slice(0,7)
        const counts = []
        for (const unique of Days){
            let count = 0;
            for (const Date of dateFormatted){
                if (unique === Date) {
                    count ++
                }
            }
            counts.push(count)
        }
        const CATEGORY = await productDb.aggregate([
            {
                $project:{
                    Category:1,_id:0
                }
            }
        ])
        const uniqueCategories = [...new Set(CATEGORY)];
        const catCounts = []
        for (const unique of uniqueCategories){
            let count = 0;
            for (const category of CATEGORY) {
                if (unique === category) {
                    count ++
                }
            }
            catCounts.push(count)
        }
        const sales = await orderDb.aggregate([
            {
                $match: {
                    status :{ $ne: "Canceled" }
                }
            },
            {
                $project:{
                    paymentMethod: 1,
                    totalAmount: 1,
                    status: 1
                }
            }
        ])
        let revenue = 0;
        let codCount = 0;
        let onlineCount = 0;
        for (const sale of sales) {
            revenue += sale.totalAmount
        }
        for (const sale of sales) {
            sale.paymentMethod === 'COD'?codCount++:onlineCount++
        }
        // console.log(uniquePay);
        console.log("revenue: " + revenue);  
        console.log("Salessssssss",sales);
        res.status(200).render('admin/dashboard',{codCount,onlineCount,revenue,activeCount,blockedCount,catCounts,uniqueCategories,counts,uniqueDates:Days,ordercount:orders.length,usercount:USERS.length,productcount:products.length})
    }else{
        req.session.isAdminLogin = false;
        res.render('admin/admin_login', { error: "" });
    }
}
// exports.chart = async(req, res)=>{

// }
