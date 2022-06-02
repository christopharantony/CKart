const categoryDb = require('../model/categoryModel')
const productDb = require('../model/productModel')
const offerDb = require('../model/offerModel')
const brandDb = require('../model/brandModel')
const cartDb = require('../model/cartModel')
const objectId = require('mongoose').Types.ObjectId
const path = require('path');
const Joi = require('joi');

// --------------------------------------------- New Product -----------------------------------------------
exports.create = async(req,res)=>{
            let images = []
            if(req.files?.Image1){images.push(req.files?.Image1)}
            if(req.files?.Image2){images.push(req.files?.Image2)}
            if(req.files?.Image3){images.push(req.files?.Image3)}
        const imgPath = []
        if(images.length){
            for (let i = 0; i < images.length; i++) {
                var uploadPath = './public/productsImg/' + Date.now()+i+'.jpeg'
                var img ='productsImg/' + Date.now()+i+'.jpeg'
                imgPath.push(img)
                images[i]?.mv(uploadPath,(err)=>{
                if(err){
                    console.log(err);
                    return res.status(500).send(err);
                }
                })
                }
        }
        const proObj = {
            Name:req.body.Name,
            Price:req.body.Price,
            Quantity:req.body.Quantity,
            Description: req.body.Description,
            Brand: req.body.Brand,
            Category:req.body.Category,
            Image:imgPath
        }
    const product = new productDb(proObj);
    const { error } = validate(proObj)
    if (error) {
        req.session.error = error.details[0].message
        res.redirect('/admin/addProErr')
    }
        product.save(product)
    .then(()=>{
        res.redirect('/admin/admin-products')
    })
    .catch(err=>{
        console.log(err.message);
    });
}
const validate = (data) => {
    const schema = Joi.object({
        Name: Joi.string().required().label("Name"),
        Price: Joi.number().required().label("Price"),
        Quantity: Joi.number().required().label("Quantity"),
        Description: Joi.string().required().label("Description"),
        Brand: Joi.string().required().label("Brand"),
        Category: Joi.string().required().label("Category"),
        Image: Joi.allow()
    })
    return schema.validate(data)
}
// --------------------------------------------- All Products -----------------------------------------------
exports.find = (req,res)=>{
    productDb.find()
    .then(data=>{
        res.status(200).render('admin/admin_products',{products:data})
    })
    .catch(err=>{
        console.log(err.message);
    })
}

// --------------------------------------------- Edit Product -----------------------------------------------
//  Edit Page
exports.updatepage = async(req,res)=>{
    console.log('Product Id : ',req.query.id);
        const product =await productDb.findOne({_id:req.query.id})
        const brand =await brandDb.find()
        const cate =await categoryDb.find()
            res.render('admin/product_update',{error:"",product,cate,brand})
}
//  Edit Product
exports.update = async(req,res)=>{
    try {
        const id = req.params.id;
        let images = []
        if(req.files?.Image1){images.push(req.files?.Image1)}
        if(req.files?.Image2){images.push(req.files?.Image2)}
        if(req.files?.Image3){images.push(req.files?.Image3)}
    const imgPath = []
    if(images.length){
        for (let i = 0; i < images.length; i++) {
        var uploadPath = './public/productsImg/' + Date.now()+i+'.jpeg'
        var img ='productsImg/' + Date.now()+i+'.jpeg'
        imgPath.push(img)
        images[i]?.mv(uploadPath,(err)=>{
        if(err){
            console.log(err);
            return res.status(500).send(err);
        }
        })
        }
        const product = {
            Name:req.body.Name,
            Price:req.body.Price,
            Quantity:req.body.Quantity,
            Description: req.body.Description,
            Brand: req.body.Brand,
            Category:req.body.Category,
            Image:imgPath
        }
        const { error } = validate(product)
        if (error) {
            req.session.id = id;
            req.session.error = error.details[0].message;
            res.redirect('/admin/updateProErr')
        }else{
        productDb.updateOne({_id:id},{$set: product })
        .then(()=>{
            res.redirect('/admin/admin-products')
        })
        .catch(err=>{
            res.send(err.message)
        })
    }
    }else{
        const product = {
            Name:req.body.Name,
            Price:req.body.Price,
            Quantity:req.body.Quantity,
            Description: req.body.Description,
            Brand: req.body.Brand,
            Category:req.body.Category            
        };
        const { error } = validate(product)
        if (error) {
            req.session.proId = id;
            req.session.error = error.details[0].message;
            res.redirect('/admin/updateProErr')
        }else{
        // productDb.findByIdAndUpdate(id,product)
        productDb.updateOne({_id:id},{$set: product })
        .then(()=>{
            res.redirect('/admin/admin-products')
        })
        .catch(err=>{
            res.send(err.message)
        })
    }
}
} catch (error) {
    console.log(error);
    res.send("Error in updating",error.message);
}
}
// )}

// --------------------------------------------- Delete Product -----------------------------------------------
exports.delete = (req,res)=>{
    const id = req.params.id;
    productDb.findByIdAndDelete(id)
    .then(()=>{
        res.redirect('/admin/admin-products')
    })
}


// ==================================================================================================
// ==================================================================================================

exports.productDetails = async (req,res)=>{
    const username = req.session.user?.name;
    image = req.query.image.split(',')
    const products = await productDb.findOne({Image:image})
    const offerPrice = await offerDb.findOne({proId:products?._id,status:true})
    let cartCount = 0
            let cart = await cartDb.findOne({user:req.session.user?._id})
            console.log('cart',cart);
            if (cart) {
                cartCount = cart.products.length
            }
    if (offerPrice){
        const offers = await offerDb.aggregate([
            {
                $match:{
                    status: true,
                    proId:products._id
                }
            },
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
                    offerPrice:{ $subtract: [ '$products.Price', { $divide: [{$multiply: ['$products.Price','$percentage']},100 ]} ] }
                }
            }
        ])
        const offerPrice = offers[0].offerPrice;
        res.render('user/offerProduct_details',{username,offerPrice,image:image, products,cartCount,isUserLogin:req.session.isUserLogin})
    }else{
        res.render('user/product_details',{username,image, products,cartCount,isUserLogin:req.session.isUserLogin})
    }
}

exports.adminProductDetails = async (req,res)=>{
    image = req.query.image.split(',')
    const products = await productDb.findOne({Image:image})
    const offerPrice = await offerDb.findOne({proId:products?._id,status:true})
    let cartCount = 0
            let cart = await cartDb.findOne({user:req.session.user?._id})
            console.log('cart',cart);
            if (cart) {
                cartCount = cart.products.length
            }
    if (offerPrice){
        const offers = await offerDb.aggregate([
            {
                $match:{
                    status: true,
                    proId:products._id
                }
            },
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
                    offerPrice:{ $subtract: [ '$products.Price', { $divide: [{$multiply: ['$products.Price','$percentage']},100 ]} ] }
                }
            }
        ])
        const offerPrice = offers[0].offerPrice;
        res.render('admin/offerProduct_details',{offerPrice,image, products,cartCount})
    }else{
        res.render('admin/product_details',{image, products,cartCount})
    }
}