const express = require("express");
const route = express.Router();
const Userdb = require("../model/model");
const Admin = require("../model/adminModel");
const brandDb = require("../model/brandModel");
const offerDb = require("../model/offerModel")
const couponDb = require("../model/couponModel")
const productDb = require("../model/productModel")
const categoryDb = require("../model/categoryModel");
const controller = require("../controller/controller");
const catController = require("../controller/catController");
const dashController = require("../controller/dashController")
const offerController = require("../controller/offerController")
const orderController = require('../controller/orderController')
const brandController = require("../controller/brandController");
const bannerController = require("../controller/bannerController")
const couponController = require("../controller/couponController")
const productController = require("../controller/productController");
const objectId = require('mongoose').Types.ObjectId
const session = require("express-session");

route.get("/",dashController.dash)

// Admin Home
route.post("/admin-home", controller.find);

route.use((req, res, next) => {
    if (!req.session.isAdminLogin) {
        res.redirect("/admin");
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

route.get('/adduserError', (req, res) => {
    const error = req.session.error;
    req.session.error = null;
    res.render('admin/add_user',{ error })
})

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
    res.status(200).render("admin/add_products", { brand, cate, error:"" });
});

// Adding Product
route.post("/add-product", productController.create);

route.get('/addProErr', async (req, res) => {
    const error = req.session.error;
    const cate = await categoryDb.find();
    const brand = await brandDb.find();
    req.session.error = null;
    res.render('admin/add_products',{ brand, cate, error });
})

// Edit Product
route.get("/update", productController.updatepage);

route.put("/update/:id", productController.update);

route.get("/updateProErr", async (req, res) => {
    const error = req.session.error;
    const id = req.session.proId;
    const product = await productDb.findOne({_id:objectId(id)});
    const brand = await brandDb.find()
    const cate = await categoryDb.find()
    req.session.proId = null;
    req.session.error = null;
    res.render('admin/product_update',{error,product,cate,brand})

})

route.delete("/delete/:id", productController.delete);

route.get("/users", (req, res) => {
    res.render("admin_home", { users: data });
});
// -------------------------------------------------- Banner -------------------------------------------
route.get('/banner',bannerController.showBanner)
route.get('/banner-add',(req, res)=>{
    res.render('admin/banner_add',{error:""})
})
route.post('/banner-add',bannerController.addBanner)

route.get('/bannerAddErr', (req, res)=>{
    res.render('admin/banner_add', { error: "Banner Image is required"})
})
route.get('/banner-update',bannerController.updatePage)
route.put('/banner-update/:id',bannerController.update)
route.delete('/banner-delete/:id',bannerController.deleteBanner)
// -------------------------------------------------- Brands -------------------------------------------

route.get("/brand", async (req, res) => {
    const brand = await brandDb.find();
    res.render("admin/admin_brand", { brand });
});

route.get("/add-brand", (req, res) => {
    res.status(200).render("admin/add_brand",{error:""});
});

route.post("/add-brand", brandController.create);

route.get('/BrandErr', (req, res) => {
    res.render('admin/add_brand',{error:"Enter the Name of the brand"})
})

route.get("/update-brand", brandController.updatepage);

route.put("/update-brand/:id", brandController.update);

route.get('/editBrandErr', async (req, res)=>{
    const id = req.session.brandId;
    req.session.brandId = null;
    console.log(req.session.brandId);
    const brand = await brandDb.findOne({_id:id})
    res.render('admin/brand_update',{error:"Enter the Name of the brand",brand})
})

route.delete("/delete-brand/:id", brandController.delete);

// -------------------------------------------- Category -------------------------------------------------

route.get("/category", async (req, res) => {
    const cate = await categoryDb.find();
    res.render("admin/admin_category", { cate });
});

route.get("/add-category", (req, res) => {
    res.status(200).render("admin/add_category",{error:""});
});

route.post("/add-category", catController.create);

route.get('/CategoryErr', (req, res) => {
    res.render('admin/add_category',{error:"Enter the Name of the Category"})
})

route.get("/update-cate", catController.updatepage);

route.put("/update-cate/:id", catController.update);

route.get('/editCateErr', async (req, res)=>{
    const id = req.session.categoryId;
    req.session.categoryId = null;
    const cate = await categoryDb.findOne({_id:id})
    res.render('admin/category_update',{error:"Enter the Name of the Category",cate})
})

route.delete("/delete-cate/:id", catController.delete);
// --------------------------------------------- Offers -----------------------------------------------
route.get("/offer",offerController.showOffer)

route.patch('/offer-status/:id', offerController.status)

route.get("/offer-add",offerController.adding) //Adding page
route.post("/offer-add",offerController.addOffer)

route.get('/offerAddErr', async (req, res)=>{
    const error = req.session.error;
    req.session.error = null;
    const pros = await productDb.find()
    return res.render('admin/offer_add',{pros,error})
})

route.get("/offer-update/:id",offerController.editOffer) //Update page
route.put("/offer-update/:id",offerController.update)

route.get('/offerEditErr', async (req, res)=>{
    const error = req.session.error;
    const id = req.session.offerId;
    req.session.offerId = null;
    req.session.error = null;
    const offer = await offerDb.findById(id)
    const pros = await productDb.find()
    return res.render('admin/offer_update',{offer,pros,error})
})

route.delete("/offer-delete/:id",offerController.delete)

// --------------------------------------------- Coupons ----------------------------------------------

route.get('/coupon',couponController.showcoupons)

route.patch('/coupon-status/:id',couponController.status)

route.get('/coupon-add',couponController.adding)
route.post('/coupon-add',couponController.addCoupon)

route.get('/couponAddErr',async (req, res)=>{
    const error = req.session.error;
    req.session.error = null;
    return res.render('admin/coupon_add',{error});
})

route.get("/coupon-update/:id",couponController.editCoupon)
route.put("/coupon-update/:id",couponController.update)

route.get('/couponEditErr',async (req, res)=>{
    const error = req.session.error;
    const id = req.session.couponId;
    req.session.error = null;
    req.session.couponId = null;
    const coupon = await couponDb.findOne({_id:id});
    return res.render('admin/coupon_update',{error,coupon});
})

route.delete("/coupon-delete/:id",couponController.delete)

// --------------------------------------------- Orders -----------------------------------------------
route.get('/admin-orders',orderController.find)

// Cancel orders
route.put('/cancel-admin/:id',orderController.cancelOrder)

// Update the status
route.post('/statusUpdate',orderController.statusUpdate)

// --------------------------------------------- Coupon History -----------------------------------------------

route.get('/coupon-history',couponController.showHistory)

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
