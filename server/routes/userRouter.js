const express = require("express");
const userRoute = express.Router();
const favDb = require('../model/favModel')
const cartDb = require('../model/cartModel')
const offerDb = require("../model/offerModel")
const orderDb = require('../model/orderModel')
const productDb = require("../model/productModel");
const bannerDb = require("../model/bannerModel")
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
// const { check, validationResult } = require("express-validator");
// const { redirect } = require("express/lib/response");
// const { findById } = require("../model/cartModel");

var ObjectId = require('mongoose').Types.ObjectId;

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

// --------------------------------------------- User Landing -----------------------------------------------
userRoute.get("/", controller.landing);

// --------------------------------------------- User Login -----------------------------------------------

userRoute.get("/login", (req, res) => {
    if (req.session.isUserLogin){
        res.redirect('/')
    }
    res.status(200).render("user/user_login", { error: "" });
});

// ------------------ Login with Mobile Number -----------------
userRoute.get("/loginotp", (req, res) => {
    if (req.session.isUserLogin){
        res.redirect('/')
    }
    res.status(200).render("user/user_loginotp", { error: "" });
});
// ------------------- OTP page -------------------
userRoute.post("/mobile", otpcontroller.mobileNum);

userRoute.get("/blockedLogin", (req, res) => {
    res.render('user/user_loginotp',{error:"Your account is blocked"})
})
userRoute.get('/notFound', (req, res) => {
    res.render('user/user_loginotp',{error:"This Number is not registered"})
})

// ------------------- OTP Submit -----------------
userRoute.post("/otp", otpcontroller.otp);
userRoute.post('/resend',otpcontroller.resend)

// -------------------------------------------------- User SignUp ---------------------------------------------------------
userRoute.get("/signup", (req, res) => {
    res.render("user/user_signup", { error: "" });
});

userRoute.post("/signup", controller.Create);

userRoute.get('/signupError',(req, res) => {
    const error = req.session.error;
    res.session.error = null;
    res.render('user/user_signup',{ error });
})



// ----------- User Home ---------------
userRoute.post("/home",controller.Find);

userRoute.get('/loginError', (req, res) => {
    const error = req.session.error;
    // res.session.error = null;
    res.render('user/user_login', { error });
})

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
    const pro = await productDb.findById(product)
    res.render('user/buyplace_order',{total:pro.Price,user,product})
})
userRoute.get('/buy-nowOff',async (req, res)=>{
    const user = req.session.user;
    const product = req.query.id;
    // const pro = await productDb.findById(product)
    const offers = await offerDb.aggregate([
        {
            $match:{
                proId:ObjectId(product)
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
                id:'$products._id',
                price:'$products.Price',
                products:'$products',
                percentage:'$percentage',
                offerPrice:{ $divide: [{$multiply: ['$products.Price','$percentage']},100 ]}
            }
        }
    ])
    console.log(offers[0].offerPrice);
    res.render('user/buyplace_order',{total:offers[0].offerPrice,user,product})
})

userRoute.post('/buyplace-order/:price/:proId',orderController.buynow)

// ------------------ Cart -------------------
userRoute.get('/cart',cartcontroller.userCart)

// Control quantity in cart
userRoute.post("/change-product-quantity",cartcontroller.changeProductQuantity)

userRoute.post("/remove-product-cart",cartcontroller.removeProcart)

userRoute.get('/place-order',orderController.myOrders)

userRoute.post('/place-order',orderController.orderPlacing)

// userRoute.get('/place-order-error/:error/:user/:total',(req,res)=>{
//     console.log(req.params);
//     const error = req.params.error;
//     const user = req.params.user;
//     const total = req.params.total;
//     res.render('user/place_order',{error,user:req.session.user,total})
// })

userRoute.post('/verify-payment',orderController.paymentVerification)

// ------------------ Order Placed ------------------------
userRoute.get('/order-success',(req,res)=>{
    res.render('user/order_success',{user:req.session.user})
})

// Add to cart
userRoute.get("/add-to-cart:id",cartcontroller.addToCart)
// userRoute.get("/add-to-cartOff:id",cartcontroller.addToCartOff)


//--------------------------------------------------------------------------------------------------------------------------------------------
// ------------------ Add Favorites ------------------------
userRoute.post("/add-to-fav:id",favController.fav)

userRoute.get('/user-fav',favController.find)

userRoute.post("/remove-product-fav",favController.removeProfav)

// Show the orders
userRoute.get('/user-orders',orderController.Find)

// Cancel the orders
userRoute.get('/cancel/:id',orderController.cancel)



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
