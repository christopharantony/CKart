var Userdb = require('../model/model');
const adminDb = require('../model/adminModel')
const productDb = require("../model/productModel");
const cartDb  = require('../model/cartModel')
const favDb = require('../model/favModel')

var ObjectId = require('mongoose').Types.ObjectId;

// SignUp
exports.Create = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    } else {
        console.log(req.body)
        const user = new Userdb({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            gender: req.body.gender,
            number: req.body.number

        });
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

    }
}



// User Login
exports.Find = async (req, res) => {

    if (req.session.isUserLogin) {
        res.redirect('/')
    } else {
        let userDb = await Userdb.findOne({ email: req.body.email, password: req.body.password })
        if (userDb) {
            if (userDb.isBlocked) {
                res.render('user/user_login', { error: "Your account is blocked" })
            }
            req.session.user = userDb;
            const userId = req.session.user?._id
            let cartCount = 0
            let cart = await cartDb.findOne({user:userDb._id})
            console.log('cart',cart);
            if (cart) {
                cartCount = cart.products.length
            }
            const products = await productDb.find()
            const wishlist = await favDb.findOne({user:ObjectId(userId)})
            fav = wishlist?.products
            req.session.isUserLogin = true;
            console.log(userDb);
            res.status(200).render('user/Home', { products,cartCount,fav,isUserLogin:req.session.isUserLogin })
        } else {
            res.render('user/user_login', { error: "Invalid Username and Password" })
        }
        
    }
}

// Create and Save new user

exports.create = (req, res) => {
    const user = new Userdb({
        name: req.body.name,
        number: req.body.number,
        email: req.body.email,
        password: req.body.password,
        gender: req.body.gender


    });
    console.log(user);
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

// New User
exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    } else {
        const user = new Userdb({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            gender: req.body.gender,
            status: req.body.status
        });

        user.save(user)
            .then(() => {
                res.redirect('/')
            })
            .catch(err => {
                console.log(err.message);
                res.status(401).render('admin_login', { error: "Invalid Input" })
            });
    }
}
