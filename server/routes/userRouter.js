const express = require("express");
const { check, validationResult } = require("express-validator");
const userRoute = express.Router();
const productDb = require("../model/productModel");
const controller = require("../controller/controller");
const otpcontroller = require("../controller/otpController")

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

// User Landing
userRoute.get("/", (req, res) => {
    productDb
        .find()
        .then((data) => {
            if (req.session.isUserLogin) {
                console.log();
                // res.status(200).render('user_home',{name:userDb.name})
                res.status(200).render("Home", { products: data });
            } else {
                req.session.isUserLogin = false;
                console.log("Im Landed Now........................");
                res.status(200).render("landing", { products: data });
            }
            // console.log(data);
            // res.status(200).render('admin_products',{products:data})
        })
        .catch((err) => {
            console.log(err.message);
        });
});

// User Login
userRoute.get("/login", (req, res) => {
    res.status(200).render("user_login", { error: false });
});

// Login with Mobile Number
userRoute.get("/loginotp", (req, res) => {
    res.status(200).render("user_loginotp", { error: false });
});

// OTP page
userRoute.post("/mobile", otpcontroller.mobileNum);

// OTP submit
userRoute.post("/otp", otpcontroller.otp);

// User SignUp
userRoute.get("/signup", (req, res) => {
    res.render("user_signup", { error: "" });
});

userRoute.post("/signup", controller.Create);

// User Home
userRoute.post("/home",
            check("email").isEmail().withMessage("Enter a valid email address"),
            controller.Find);

// User Logout
userRoute.get("/logout_user", (req, res) => {
    console.log(req.session);
    req.session.destroy(function (err) {
        res.clearCookie();
        if (err) {
            console.log(err);
            res.send("Error");
        } else {
            res.redirect('/')
            // res.render("user_login", { error: "Logout successfully" });
        }
    });
});

module.exports = userRoute;
