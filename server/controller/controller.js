const Joi = require('joi');
const bcrypt = require('bcrypt');
var Userdb = require('../model/model');
const favDb = require('../model/favModel')
const cartDb  = require('../model/cartModel')
const offerDb = require('../model/offerModel')
const adminDb = require('../model/adminModel')
const bannerDb = require('../model/bannerModel')
const productDb = require("../model/productModel");
const passwordComplexity = require('joi-password-complexity');

var ObjectId = require('mongoose').Types.ObjectId;

exports.landing = async(req, res) => {
    try {
        const products =await productDb.find()
        const banners = await bannerDb.find()
        const offers = await offerDb.aggregate([
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
            if (req.session.isUserLogin) {
            let cartCount = 0
            let cart = await cartDb.findOne({user:req.session.user._id})
            if (cart) {
                cartCount = cart.products.length
            }
            const userId = req.session.user?._id
            const wishlist = await favDb.findOne({user:ObjectId(userId)})
            fav = wishlist?.products
                res.status(200).render("user/Home", { offers,banners,products,isUserLogin:req.session.isUserLogin,fav,cartCount});
            } else {
                req.session.isUserLogin = false;
                res.status(200).render("user/Home", { offers,banners,products,isUserLogin:req.session.isUserLogin});
            }
    } catch (error) {
        console.log(error.message);
    }
}

// SignUp
exports.Create = async (req, res) => {
        try {
            const USER = await Userdb.findOne({ $or: [{email: req.body.email},{number: req.body.number}]})
            if (USER){
                req.session.error = "Account already in use"
                res.redirect('/signupError')
            }
            req.body.password = await bcrypt.hash(req.body.password,10)
            const userObj = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                gender: req.body.gender,
                number: req.body.number
            }
            const user = new Userdb(userObj);
            const { error } = validate(userObj)
            if (error) {
                req.session.error = error.details[0].message
                return res.redirect('/signupError')
            }
                user.save()
                    .then(() => {
                        res.status(201).redirect('/login')
                    })
                    .catch(err => {
                        console.log(err);
                        res.send("Error: " + err.message)
                    })
        } catch (error) {
            console.log(error.message);
            res.send("Error Message: " + error.message)
        }
}



// User Login
exports.Find = async (req, res) => {
    if (req.session.isUserLogin) {
        res.redirect('/')
    } else {
        let userDb = await Userdb.findOne({ email: req.body.email})
        if (userDb) {
            if (userDb.isBlocked) {
                req.session.error = "Your account is blocked";
                res.redirect("/loginError")
            }else{
            req.session.user = userDb;
            const userId = req.session.user?._id
            bcrypt.compare(req.body.password,userDb.password).then((status)=>{
                if(status){
                    req.session.isUserLogin = true;
                    res.redirect('/')
        //     let cartCount = 0
        //     // let cart = await cartDb.findOne({user:userDb._id})
        //     cartDb.findOne({user:userDb._id})
        //     .then((cart)=>{
        //         // const banners = await bannerDb.find()
        //         bannerDb.find()
        //         .then((banners)=>{
        //             if (cart) {
        //                 cartCount = cart.products.length
        //         }
        //         // const offers = await offerDb.aggregate([
        //         offerDb.aggregate([
        //             {
        //                 $lookup:{
        //                     from: 'productdbs',
        //                     localField:'proId',
        //                     foreignField:'_id',
        //                 as:'products'
        //             }
        //         },
        //         {
        //             $unwind:'$products'
        //         },
        //         {
        //             $project:{
        //                 id:'$products._id',
        //                 price:'$products.Price',
        //                 products:'$products',
        //                 percentage:'$percentage',
        //                 offerPrice:{ $divide: [{$multiply: ['$products.Price','$percentage']},100 ]}
        //             }
        //         }
        //     ]).then(async(offers)=>{
        //         const products = await productDb.find()
        //         const wishlist = await favDb.findOne({user:ObjectId(userId)})
        //         fav = wishlist?.products
        //         req.session.isUserLogin = true;
        //         res.status(200).render('user/Home', { offers,banners,products,cartCount,fav,isUserLogin:req.session.isUserLogin })
        //     })
        // })
        // })
        }else{
            req.session.error = "Invalid Password";
            res.redirect('/loginError')
        }
    })
}
        } else {
            req.session.error = "Invalid Username and Password";
            res.redirect('/loginError')
        }
        
    }
}

// Create and Save new user

exports.create = async (req, res) => {
    try {
        const USER = await Userdb.findOne({ $or: [{email: req.body.email},{number: req.body.number}]})
        if (USER){
            req.session.error = "Account already in use"
            res.redirect('/adduserError')
        }
        req.body.password = await bcrypt.hash(req.body.password,10)
        const userObj = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            gender: req.body.gender,
            number: req.body.number
        }
        const user = new Userdb(userObj);
        const { error } = validate(userObj);
        if (error) {
            req.session.error = error.details[0].message
            return res.redirect('/adduserError')
        }else{
        user.save(user)
        .then(() => {
            req.session.error = ""
            res.redirect('/adduserError')
            })
            .catch(err => {
                console.log(err);
                res.send('Error',err.message)
                
            })
        }
    }catch(err) {
    console.log(err);
        res.send("Error During creating user: " + err.message)
    }
}

// Admin Home

exports.find = async (req, res) => {
    try {
        const data = await Userdb.find()
        if (req.session.isAdminLogin) {
            // res.status(200).render('admin/admin_home', { users: data })
            res.status(200).render('admin/dashboard')
        } else {
            const admin = await adminDb.findOne({email:req.body.email, password:req.body.password})
            if (admin) {
                req.session.admin = req.body.email;
                req.session.isAdminLogin = true;
                res.status(200).redirect('/admin')
            } else {
                res.status(401).render('admin/admin_login', { error: "Invalid Username or Password" })
            }
        }
    } catch (err) {
        console.log(err.message);
    }
}

exports.users = (req, res) => {
    Userdb.find()
        .then(data => {
            res.status(200).render('admin/admin_home', { users: data })
        })
        .catch(err => {
            console.log(err.message);
        })
}

// Search user

exports.search = (req, res) => {

    Userdb.find({
        name: new RegExp(req.query.searchName, "i")
    })
        .then(data => {
            res.render('admin/admin_home', { users: data })
        })
}

// Block and Unblock User
exports.block = async (req,res)=>{
    try {
        const user =await Userdb.findOne( {_id:req.params.id })
        console.log("user.isBlocked",user.isBlocked)
        console.log("req.params.id",req.params.id);
        if (user.isBlocked){
            await Userdb.updateOne({_id:req.params.id},{isBlocked:false})
            .then(()=>{
                res.status(200).redirect('/users');
            })
        }else{
            await Userdb.updateOne({_id:req.params.id},{isBlocked:true})
            .then(()=>{
                res.status(200).redirect('/users');
            })
        }
    } catch (error) {
        res.status(400).send(error)
    }
}

        const validate = (data) => {
            const schema = Joi.object({
                name: Joi.string().min(3).max(10).required().label("Name"),
                email: Joi.string().email().required().label("Email"),
                password: new passwordComplexity({min:8,max:100,lowerCase:1,upperCase:1,numeric:1}).required().label("Password"),
                number:Joi.string().length(10).pattern(/^[0-9]+$/).required().label("Number"),
                gender: Joi.allow()
            })
            return schema.validate(data)
        }