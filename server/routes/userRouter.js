const express = require('express');
const userRoute=express.Router();
const userDb = require('../model/model');
const controller = require('../controller/controller')

// User Landing
userRoute.get('/',(req,res)=>{
    if (req.session.isUserLogin) {
        console.log();
        // res.status(200).render('user_home',{name:userDb.name})
        res.status(200).render('Home')
    } else {
        req.session.isUserLogin=false
        res.status(200).render('landing')
        

    }
});

// User Login 
userRoute.get('/login',(req,res)=>{
    res.status(200).render('user_login',{error:false})
})

// 

// User SignUp
userRoute.get('/signup',(req,res)=>{
    res.render('user_signup',{error:""})
})

userRoute.post('/signup',controller.Create)

// User Home
userRoute.post('/home',controller.Find)

// User Logout
userRoute.get('/logout_user',(req,res)=>{
    console.log(req.session);
    req.session.destroy(function(err){
        res.clearCookie()
        if (err) {
            console.log(err);
            res.send("Error")
        }else{
            res.render('user_login',{error:"Logout successfully"})
        }
        
        
    })
})

module.exports = userRoute;