const express = require('express');
const route=express.Router();
const userDb = require('../model/model');
const controller = require('../controller/controller')

// Admin
const admin = {
    email:'admin@gmail.com',
    password:'admin123'
}

// Admin Login
route.get('/admin',(req,res)=>{
    userDb.find()
    .then(data=>{
        if (req.session.isAdminLogin) {
            res.status(200).render('adminHome',{users:data})
        } else {
            req.session.isAdminLogin=false;
            res.status(200).render('admin_login',{error:""})
        }
    }).catch(err=>{
        console.error(err.message);
    })
})

// Admin Home

route.post('/admin_home',controller.find);

route.use('/admin_home',(req,res,next)=>{
    if (!req.session.isAdminLogin) {
        res.status(200).redirect("/admin")
    } else { 
        next();
        
    }
})
// Adding User
route.get('/add',(req,res)=>{
    res.render('add_user',{error:""})
});

route.post('/adding',controller.create)

// Searching User
route.get('/search',controller.search)

// Edit User
route.get('/update',controller.updatepage)

route.put('/update/:id',controller.update)

// Delete User
route.delete('/delete/:id',controller.delete)

route.get('/users',(req,res)=>{
    res.render('admin_home',{users:data})
})
// --------------PRODUCTS--------------------

route.get('/admin_products',(req,res)=>{
    res.render('admin_products')
})

route.get('/add-product',(req,res)=>{
    res.status(200).render('add_products')
})

route.post('/add-product',(req,res)=>{
    console.log(req.body);
})


// Admin Logout 
route.get('/logout_admin',(req,res)=>{
    req.session.destroy(function(err){
        res.clearCookie()
        console.log(req.session);
        if (err) {
            res.status(403).send("Hai Admin, Error while logingout")
        } else {
            res.status(200).redirect('/')
        }
    })
})



module.exports = route;