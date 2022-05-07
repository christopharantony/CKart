const express = require("express");
const userRoute = express.Router();
const favDb = require('../model/favModel')
const cartDb = require('../model/cartModel')
const orderDb = require('../model/orderModel')
const productDb = require("../model/productModel");
const controller = require("../controller/controller");
const otpcontroller = require("../controller/otpController")
const favController = require("../controller/favController")
const cartcontroller = require('../controller/CartController');
const orderController = require('../controller/orderController')
const productController = require('../controller/productController')


const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_GHZ8qfO5RgHRDG',
    key_secret: '96OZZd2cbBqVjnR6ZLeQrGOU',
    });

const crypto = require('crypto');
const { check, validationResult } = require("express-validator");
const { redirect } = require("express/lib/response");
const { findById } = require("../model/cartModel");

var ObjectId = require('mongoose').Types.ObjectId;

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

// --------------------------------------------- User Landing -----------------------------------------------
userRoute.get("/", async(req, res) => {
    try {
        const products =await productDb.find()
            if (req.session.isUserLogin) {
                // let userDb = null
                // req.session.user = userDb;
                console.log(req.session.user);
            let cartCount = 0
            let cart = await cartDb.findOne({user:req.session.user._id})
            if (cart) {
                cartCount = cart.products.length
            }
                res.status(200).render("user/Home", { products,isUserLogin:req.session.isUserLogin,cartCount});
            } else {
                req.session.isUserLogin = false;
                console.log("Im Landed Now........................");
                res.status(200).render("user/Home", { products,isUserLogin:req.session.isUserLogin});
            }
    } catch (error) {
        console.log(error.message);
    }
});

// --------------------------------------------- User Login -----------------------------------------------

userRoute.get("/login", (req, res) => {
    if (req.session.isUserLogin){
        res.redirect('/')
    }
    res.status(200).render("user/user_login", { error: "" });
});

// ------------------ Login with Mobile Number -----------------
userRoute.get("/loginotp", (req, res) => {
    res.status(200).render("user/user_loginotp", { error: "" });
});

// ------------------- OTP page -------------------
userRoute.post("/mobile", otpcontroller.mobileNum);

// ------------------- OTP Submit -----------------
userRoute.post("/otp", otpcontroller.otp);
userRoute.post('/resend',otpcontroller.resend)

// -------------------------------------------------- User SignUp ---------------------------------------------------------
userRoute.get("/signup", (req, res) => {
    res.render("user/user_signup", { error: "" });
});

userRoute.post("/signup", controller.Create);

// ----------- User Home ---------------
userRoute.post("/home",controller.Find);

// ------------------ Product Details ---------------------------
userRoute.get('/productDetail', productController.productDetails)

// Check User using Middleware
// userRoute.use((req, res, next) => {
//     if (!req.session.isUserLogin) {
//         console.log("not User");
//         res.status(200).redirect("/");
//     } else next();
// });
// ---------------- Buy Now  -----------------
userRoute.get('/buy-now',async (req, res)=>{
    const user = req.session.user;
    const product = req.query.id;
    console.log(`user : ${user} product : ${product}`);
    const pro = await productDb.findById(product)
    console.log(`pro.Price : ${pro.Price}`)
    res.render('user/buyplace_order',{total:pro.Price,user,product})
})

userRoute.post('/buyplace-order/:price/:proId',async (req, res)=>{
    const userId = req.body.userId
    const proId = req.body.proId
    const total = parseInt(req.params.price);
    console.log(`req.body : ${req.body}`)
    console.log("Price", req.params.price);
    console.log("User ID : ",req.body.userId)

    let products = [{item:ObjectId(proId),quantity: 1}]

    let status = req.body['payment-method']==='COD'?'placed':'pending'
    let orderObj = new orderDb({
        deliveryDetails:{
            name:req.body.Name,
            mobile:req.body.mobile,
            address:req.body.address,
            pincode:req.body.Pincode
        },
        userId:ObjectId(userId),
        paymentMethod:req.body['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date: new Date()
    })
    orderObj.save()
    await productDb.updateOne({"_id": ObjectId(proId)},
    {
        $inc: { Quantity : -1 }
    })
    if(req.body['payment-method']=='COD'){
        res.json({codSuccess:true})
    }else{
        console.log(`total : ${total} Product : ${products[0].item} `)
        var options = {
            amount: total*100,
            currency: "INR",
            receipt: ""+products[0].item,
            notes: {
                key1: "value3",
                key2: "value2"
            }
        }
        instance.orders.create(options, function(err, order) {
            if (err) {
                console.log('error',err);
            }else {
                console.log("New Order",order);
                res.json(order);
            }
        })
        
    }
    
    

})

// ------------------ Cart -------------------
userRoute.get('/cart',cartcontroller.userCart)

// Control quantity in cart
userRoute.post("/change-product-quantity",cartcontroller.changeProductQuantity)

userRoute.post("/remove-product-cart",cartcontroller.removeProcart)

userRoute.get('/place-order',orderController.myOrders)

userRoute.post('/place-order',orderController.orderPlacing)

userRoute.post('/verify-payment',orderController.paymentVerification)

// ------------------ Order Placed ------------------------
userRoute.get('/order-success',(req,res)=>{
    res.render('user/order_success',{user:req.session.user})
})

// Add to cart
userRoute.get("/add-to-cart:id",cartcontroller.addToCart)

//--------------------------------------------------------------------------------------------------------------------------------------------
// ------------------ Add Favorites ------------------------
userRoute.post("/add-to-fav:id",favController.fav)

userRoute.get('/user-fav',favController.find)

userRoute.post("/remove-product-fav",favController.removeProfav)

// Show the orders
userRoute.get('/user-orders',orderController.Find)

// Cancel the orders
userRoute.put('/cancel/:id',orderController.cancel)


userRoute.get("/logout_user", (req, res) => {
    // req.session.destroy(function (err) {
    //     res.clearCookie();
    //     if (err) {
    //         console.log(err);
    //         res.send("Error");
    //     } else {
    //         res.redirect('/')
    //     }
    // });
    req.session.user = null;
    req.session.isUserLogin = false;
    res.redirect('/')
});

module.exports = userRoute;
