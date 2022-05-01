const express = require("express");
const userRoute = express.Router();
const cartDb = require('../model/cartModel')
const orderDb = require('../model/orderModel')
const productDb = require("../model/productModel");
const controller = require("../controller/controller");
const otpcontroller = require("../controller/otpController")
const cartcontroller = require('../controller/CartController');
const orderController = require('../controller/orderController')
const productController = require('../controller/productController')
const { check, validationResult } = require("express-validator");
const { redirect } = require("express/lib/response");

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
                req.session.user = userDb;
            let cartCount = 0
            let cart = await cartDb.findOne({user:userDb._id})
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

// ------------------ Cart -------------------
userRoute.get('/cart',cartcontroller.userCart)

// Control quantity in cart
userRoute.post("/change-product-quantity",cartcontroller.changeProductQuantity)

userRoute.post("/remove-product-cart",cartcontroller.removeProcart)

userRoute.get('/place-order',orderController.myOrders)

userRoute.post('/place-order',orderController.orderPlacing)

// ------------------ Order Placed ------------------------
userRoute.get('/order-success',(req,res)=>{
    res.render('user/order_success',{user:req.session.user})
})

// Add to cart
userRoute.get("/add-to-cart:id",cartcontroller.addToCart)

// Show the orders
userRoute.get('/user-orders',orderController.Find)

// Cancel the orders
userRoute.put('/cancel/:id',orderController.cancel)


userRoute.get("/logout_user", (req, res) => {
    req.session.destroy(function (err) {
        res.clearCookie();
        if (err) {
            console.log(err);
            res.send("Error");
        } else {
            res.redirect('/')
        }
    });
});

module.exports = userRoute;
