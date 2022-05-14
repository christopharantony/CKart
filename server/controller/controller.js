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

// SignUp
exports.Create = async (req, res) => {
        try {
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
                return res.render('user/user_signup',{error: error.details[0].message})
            }
            if (user.password.length > 7) {
                user.save()
                    .then(() => {
                        res.status(201).render('user/user_login', { error: "" })
                    })
                    .catch(err => {
                        console.log(err.message);
                        res.status(401).render('user/user_signup', { error: "Account already in use" })
                    })
            } else {
                res.render('user/user_signup', { error: "Password must contain atleast 8 characters" })
            }
            
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
                res.render('user/user_login', { error: "Your account is blocked" })
            }else{
            req.session.user = userDb;
            const userId = req.session.user?._id
            bcrypt.compare(req.body.password,userDb.password).then((status)=>{
                if(status){


            let cartCount = 0
            // let cart = await cartDb.findOne({user:userDb._id})
            cartDb.findOne({user:userDb._id})
            .then((cart)=>{
                // const banners = await bannerDb.find()
                bannerDb.find()
                .then((banners)=>{
                    if (cart) {
                        cartCount = cart.products.length
                }
                // const offers = await offerDb.aggregate([
                offerDb.aggregate([
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
            ]).then(async(offers)=>{

                const products = await productDb.find()
                const wishlist = await favDb.findOne({user:ObjectId(userId)})
                fav = wishlist?.products
                req.session.isUserLogin = true;
                res.status(200).render('user/Home', { offers,banners,products,cartCount,fav,isUserLogin:req.session.isUserLogin })
            })
        })
        })
        }else{
            res.render('user/user_login', { error: "Invalid Password" })
        }
    })
}
        } else {
            res.render('user/user_login', { error: "Invalid Username and Password" })
        }
        
    }
}

// Create and Save new user

exports.create = (req, res) => {
    try {
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
            return res.render('admin/add_user',{error: error.details[0].message})
        }else{
    if (user.password.length > 7) {
        user.save(user)
        .then(() => {
            res.render('admin/add_user', { error: "" })
            })
            .catch(err => {
                console.log(err.message);
                res.render('admin/add_user', { error: "Account is already in use" })
                
            })
        } else {
            res.render('admin/add_user', { error: "Password must contain at least 8 characters" })
        }
    }
}catch(err) {
    console.log(err.message);
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