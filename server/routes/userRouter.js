const express = require("express");
const { check, validationResult } = require("express-validator");
const userRoute = express.Router();
const productDb = require("../model/productModel");
const cartDb = require('../model/cartModel')
const controller = require("../controller/controller");
const otpcontroller = require("../controller/otpController")
const cartcontroller = require('../controller/CartController')

var ObjectId = require('mongoose').Types.ObjectId;

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

// User Landing
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

// User Login
userRoute.get("/login", (req, res) => {
    if (req.session.isUserLogin){
        res.redirect('/')
    }
    res.status(200).render("user/user_login", { error: "" });
});

// Login with Mobile Number
userRoute.get("/loginotp", (req, res) => {
    res.status(200).render("user/user_loginotp", { error: "" });
});

// OTP page
userRoute.post("/mobile", otpcontroller.mobileNum);

// OTP submit
userRoute.post("/otp", otpcontroller.otp);
userRoute.post('/resend',otpcontroller.resend)

// User SignUp
userRoute.get("/signup", (req, res) => {
    res.render("user/user_signup", { error: "" });
});

userRoute.post("/signup", controller.Create);

// User Home
userRoute.post("/home",
            controller.Find);

// Product Details
userRoute.get('/productDetail', async (req,res)=>{
    const products = await productDb.findOne({Image:req.query.image})
    res.render('user/product_details',{image:req.query.image, products,cartCount,isUserLogin:req.session.isUserLogin})
})

// Check User using Middleware
// userRoute.use((req, res, next) => {
//     if (!req.session.isUserLogin) {
//         console.log("not User");
//         res.status(200).redirect("/");
//     } else next();
// });

// --------------------- Cart ---------------------------
userRoute.get('/cart',async(req,res)=>{
    const userId = req.session.user?._id;
    let cartItems = await cartDb.aggregate([
        {
            $match:{user:ObjectId(userId)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:'productdbs',
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
        },
        {
            $project:{
                item: 1, quantity: 1 ,product: { $arrayElemAt: ['$product',0]}
            }
        }
    ])
    res.render('user/cart',{cartItems})
    // res.json(cartItems)
    // res.send("Added")
})

// Control quantity in cart
userRoute.post("/change-product-quantity",
    cartcontroller.changeProductQuantity
)

// Remove product from the cart
userRoute.post("/remove-product-cart",cartcontroller.removeProcart)

// Place Order
userRoute.get('/place-order',(req,res)=>{
    const total = req.query.total;
    res.render('user/place_order',{total})
})

// Add to cart
userRoute.get("/add-to-cart:id",cartcontroller.addToCart)

// User Logout
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
