const express = require("express");
const userRoute = express.Router();
const favDb = require('../model/favModel')
const cartDb = require('../model/cartModel')
const offerDb = require("../model/offerModel")
const orderDb = require('../model/orderModel')
const bannerDb = require("../model/bannerModel")
const productDb = require("../model/productModel");
const couponUsedDb = require("../model/couponUsedModel")
const savedAddressDb = require("../model/savedAddressModel")

const savedController = require("../controller/savedController")
const controller = require("../controller/controller");
const otpcontroller = require("../controller/otpController")
const favController = require("../controller/favController")
const cartcontroller = require('../controller/CartController');
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')
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
    req.session.error = null;
    res.render('user/user_signup',{ error });
})



// ----------- User Home ---------------
userRoute.post("/home",controller.Find);

userRoute.get('/loginError', (req, res) => {
    const error = req.session.error;
    req.session.error = null;
    res.render('user/user_login', { error });
})

// ------------------ Product Details ---------------------------
userRoute.get('/productDetail', productController.productDetails)

// Check User using Middleware
userRoute.use((req, res, next) => {
    if (!req.session.isUserLogin) {
        console.log("not User");
        res.status(200).redirect("/");
    } else next();
});
// ---------------- Buy Now  -----------------
userRoute.get('/buy-now',orderController.buynowPage)

userRoute.post('/save-address',savedController.saveAddress)

userRoute.post('/buyplace-order/:price/:proId',orderController.buynow)

// ------------------ Cart -------------------
userRoute.get('/cart',cartcontroller.userCart)

// Control quantity in cart
userRoute.post("/change-product-quantity",cartcontroller.changeProductQuantity)

userRoute.post("/remove-product-cart",cartcontroller.removeProcart)

userRoute.get('/place-order',orderController.myOrders)

userRoute.post('/place-order/:price',orderController.orderPlacing)

userRoute.post('/verify-payment',orderController.paymentVerification)

// ------------------ Order Placed ------------------------
userRoute.get('/order-success',async(req,res)=>{
    const address = req.session.address;
    const proId = req.session.products;
    console.log("req.session.orderDate",req.session.orderDate);
    const order = await orderDb.findOne({date:req.session.orderDate})
await orderDb.updateOne({date:req.session.orderDate}, { $set: {status:'Ordered'} })
    const products = await productDb.find( {_id: { $in: proId } } )
    res.render('user/order_success',{user:req.session.user,address,cartItems:products})
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

userRoute.get('/user-profile',async(req,res)=>{
    const user = req.session.user
    res.render('user/profile',{user,error:"",passworderror:""})
})
userRoute.post('/profile-edit',controller.profileEdit)

userRoute.get('/profileError',(req, res) => {
    const user = req.session.user
    const error = req.session.error;
    req.session.error = null;
    res.render('user/profile',{ user,error,passworderror:"" });
})

userRoute.post('/password-change',controller.passwordChange)
userRoute.get('/pswdChangeErr', (req, res)=>{
    const user = req.session.user;
    const passworderror = req.session.passwordError;
    res.render('user/profile',{ user,error:"",passworderror });
})
// Cancel the orders
userRoute.get('/cancel/:id',orderController.cancel)

// ------===========================------------Apply Coupons -----------======================-------------

userRoute.post("/applycoupon/:coupon/:total",couponController.applyCoupon)


userRoute.get("/logout_user", (req, res) => {
    req.session.user = null;
    req.session.isUserLogin = false;
    res.redirect('/')
});

module.exports = userRoute;
