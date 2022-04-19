const express = require('express');
const route=express.Router();
const Userdb = require('../model/model');
const categoryDb = require('../model/categoryModel')
const controller = require('../controller/controller')
const catController = require('../controller/catController')
const productController = require('../controller/productController')
const session = require('express-session');

// Session Checking
// const verifyLogin = (req,res,next)=>{
//     if(req.session.isAdminLogin){
//         next()
//     }else{
//         req.redirect('/admin')
//     }
// }

// Admin
const admin = {
    email:'admin@gmail.com',
    password:'admin123'
}

// Admin Login
route.get('/admin',(req,res)=>{
    Userdb.find()
    .then(data=>{
        if (req.session.isAdminLogin) {
            res.status(200).render('admin_home',{users:data})
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

route.get('/users',controller.users)

// Adding User
route.get('/add',(req,res)=>{
    res.render('add_user',{error:""})
});

route.post('/adding',controller.create)

// Searching User
route.get('/search',controller.search)

// User Status

route.patch('/status/:id',async (req,res)=>{
    console.log(req.params.id,"      ------------------router 58");
    try {
        const user =await Userdb.findOne( {_id:req.params.id })
        
        console.log(user.schema.paths,'       @@@@@@@@@@@@@@@@@@@@@@@@@@@');
        if (user.status){
            await Userdb.updateOne({_id:req.params.id},{status:false})
            .then(()=>{
                res.status(200).redirect('/users');
            })
        }else{
            await Userdb.updateOne({_id:req.params.id},{status:true})
            .then(()=>{
                res.status(200).redirect('/users');
            })
        }
    } catch (error) {
        res.status(400).send(error)
    }
})
// route.get('/update',controller.updatepage)

// route.put('/update/:id',controller.update)

// Delete User
// route.delete('/delete/:id',controller.delete)

// route.get('/users',(req,res)=>{
//     res.render('admin_home',{users:data})
// })
// --------------PRODUCTS--------------------

route.get('/admin_products',productController.find
// (req,res)=>{res.render('admin_products')}
)

route.get('/add-product',(req,res)=>{
    categoryDb.find()
    .then(data=>{
        res.status(200).render('add_products',{cate:data})
    })
    
})

route.post('/add-product',productController.create)

// Edit Product
route.get('/update',productController.updatepage)

route.put('/update/:id',productController.update)

// Delete Product
route.delete('/delete/:id',productController.delete)

route.get('/users',(req,res)=>{
    res.render('admin_home',{users:data})
})

// ---------------- Category ---------------------

route.get('/category',async (req,res)=>{
    const cate =await categoryDb.find()
    res.render('admin_category',{cate})
})

route.get('/add-category',(req,res)=>{
    res.status(200).render('add_category')
})

route.post('/add-category',catController.create)

route.get('/update-cate',catController.updatepage)

route.put('/update-cate/:id',catController.update)

route.delete('/delete-cate/:id',catController.delete)



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