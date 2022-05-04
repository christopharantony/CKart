const express = require("express");
const route = express.Router();

const Userdb = require("../model/model");
const Admin = require("../model/adminModel");
const brandDb = require("../model/brandModel");
const categoryDb = require("../model/categoryModel");
const controller = require("../controller/controller");
const orderController = require('../controller/orderController')
const catController = require("../controller/catController");
const brandController = require("../controller/brandController");
const productController = require("../controller/productController");

const session = require("express-session");

// Session Checking
// const verifyLogin = (req,res,next)=>{
//     if(req.session.isAdminLogin){
//         next()
//     }else{
//         req.redirect('/admin')
//     }
// }

// Admin Login
route.get("/admin", (req, res) => {
    Userdb.find()
        .then((data) => {
            if (req.session.isAdminLogin) {
                res.status(200).render("admin/admin_home", { users: data });
            } else {
                req.session.isAdminLogin = false;
                res.status(200).render("admin/admin_login", { error: "" });
            }
        })
        .catch((err) => {
            console.error(err.message);
        });
});

// Admin Home

route.post("/admin-home", controller.find);

// route.use('/admin-home',(req,res,next)=>{
//     if (!req.session.isAdminLogin) {
//         res.status(200).redirect("/admin")
//     } else {
//         next();

//     }
// })

route.use((req, res, next) => {
    if (!req.session.isAdminLogin) {
        console.log("not admin");
        res.status(200).redirect("/admin");
    } else next();
});
// Method Override
route.use((req,res,next)=>{
    if(req.query._method == "DELETE"){
        req.method = "DELETE";
        req.url = req.path;
    }else if(req.query._method == "PUT"){
        req.method = "PUT";
        req.url = req.path;
    }
    next();
})
route.get("/users", controller.users);

// Adding User
route.get("/add", (req, res) => {
    res.render("admin/add_user", { error: "" });
});

route.post("/adding", controller.create);

// Searching User
route.get("/search", controller.search);

// User Status

route.patch("/status/:id", controller.block);



// ------------------------------------PRODUCTS---------------------------------------------------------

route.get("/admin-products", productController.find);

// Product Add Form
route.get("/add-product", async (req, res) => {
    const brand = await brandDb.find();
    const cate = await categoryDb.find();
    res.status(200).render("admin/add_products", { brand, cate });
});

// Adding Product
route.post("/add-product", productController.create);

// Edit Product
route.get("/update", productController.updatepage);

route.put("/update/:id", productController.update);


route.delete("/delete/:id", productController.delete);

route.get("/users", (req, res) => {
    res.render("admin_home", { users: data });
});

// -------------------------------------------------- Brands -------------------------------------------

route.get("/brand", async (req, res) => {
    const brand = await brandDb.find();
    res.render("admin/admin_brand", { brand });
});

route.get("/add-brand", (req, res) => {
    res.status(200).render("admin/add_brand");
});

route.post("/add-brand", brandController.create);

route.get("/update-brand", brandController.updatepage);

route.put("/update-brand/:id", brandController.update);

route.delete("/delete-brand/:id", brandController.delete);

// -------------------------------------------- Category -------------------------------------------------

route.get("/category", async (req, res) => {
    const cate = await categoryDb.find();
    res.render("admin/admin_category", { cate });
});

route.get("/add-category", (req, res) => {
    res.status(200).render("admin/add_category");
});

route.post("/add-category", catController.create);

route.get("/update-cate", catController.updatepage);

route.put("/update-cate/:id", catController.update);

route.delete("/delete-cate/:id", catController.delete);

// --------------------------------------------- Orders -----------------------------------------------
route.get('/admin-orders',orderController.find)

// Cancel orders
route.put('/cancel-admin/:id',orderController.cancelOrder)

// Update the status
route.post('/statusUpdate',orderController.statusUpdate)



// --------------------------------------------- LogOut -----------------------------------------------
// Admin Logout
route.get("/logout_admin", (req, res) => {
    // req.session.destroy(function (err) {
    //     res.clearCookie();
    //     console.log(req.session);
    //     if (err) {
    //         res.status(403).send("Hai Admin, Error while logingout");
    //     } else {
    //         res.status(200).redirect("/");
    //     }
    // });
    req.session.isAdminLogin = false;
    res.redirect('/')
});

module.exports = route;
