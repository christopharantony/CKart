var Userdb = require('../model/model');
const adminDb = require('../model/adminModel')
const productDb = require("../model/productModel");


// const admin = {
//     email:'admin@gmail.com',
//     password:'admin123'
// }

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
            user.save(user)
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
        userDb = await Userdb.findOne({ email: req.body.email, password: req.body.password })
        if (userDb) {
            if (userDb.isBlocked) {
                res.render('user/user_login', { error: "Your account is blocked" })
            }
            const products = await productDb.find()
            req.session.user = req.body.userDb;
            req.session.isUserLogin = true;
            console.log(userDb);
            // res.render('user_home',{name:userDb.name})
            res.status(200).render('user/Home', { products,isUserLogin:req.session.isUserLogin })
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
            res.status(200).render('admin/admin_home', { users: data })
        } else {
            const admin = await adminDb.findOne({email:req.body.email, password:req.body.password})
            if (admin) {
                req.session.admin = req.body.email;
                req.session.isAdminLogin = true;
                res.status(200).render('admin/admin_home', { users: data })
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

// //Product Update Page

// exports.updatepage = (req, res) => {
//     console.log(req.query.id);
//     Userdb.findOne({ _id: req.query.id })
//         .then(data => {
//             res.render('product_update', { product: data })
//         })
// }

// // Update User
// exports.update = (req, res) => {
//     const id = req.params.id;
//     Userdb.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
//         .then(data => {
//             res.redirect('/admin')
//         })
// }

// // Delete User
// exports.delete = (req, res) => {
//     const id = req.params.id;
//     Userdb.findByIdAndDelete(id)
//         .then(data => {
//             res.redirect('/admin')
//         })
// }

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



// // Return all users / Single User

// exports.find = async(req,res)=>{
//     userDb = await userDb.findOne({email:req.body.email,password:req.body.password})
//     if(userDb) {

//         req.session.user=req.body.email;
//         req.session.isUserLogin = true;
//         req.render('user_home',{name:userDb.name})
//     }else{
//         res.render('user_login',{error:"true"})
//     }
