const categoryDb = require('../model/categoryModel')
const productDb = require('../model/productModel')
const brandDb = require('../model/brandModel')
const cartDb = require('../model/cartModel')
const objectId = require('mongoose').Types.ObjectId
const path = require('path');
const Joi = require('joi');

// --------------------------------------------- New Product -----------------------------------------------
exports.create = async(req,res)=>{
    if(!req.body){
        res.status(400).send({ message :"Content can not be empty!"});
        return;
    }else{
        console.log("req.body",req.body);
        console.log("req.files",req.files);
        let images = [req.files?.Image1,req.files?.Image2,req.files?.Image3]
        console.log(images);
        const imgPath = []
        if(images){
            for (const image of images){
            var uploadPath = './public/productsImg/' + Date.now()+'.jpeg'
            var img ='productsImg/' + Date.now()+'.jpeg'
            imgPath.push(img)
            console.log('img',img);
            image?.mv(uploadPath,(err)=>{
            console.log(uploadPath);
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
        const brand = await brandDb.find();
        const cate = await categoryDb.find();
        return res.render('admin/add_products',{ brand, cate, error: error.details[0].message});
    }
        product.save(product)
    .then((data)=>{
        console.log(data);
        res.redirect('/admin-products')
    })
    .catch(err=>{
        console.log(err.message);
    });
}
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
            const product =await productDb.findOne({_id:objectId(id)})
            const brand =await brandDb.find()
            const cate =await categoryDb.find()
            res.render('admin/product_update',{error:error.details[0].message,product,cate,brand})
        }else{
        productDb.updateOne({_id:id},{$set: product })
        .then(()=>{
            res.redirect('/admin-products')
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
        console.log('Type of Product : ',typeof(product.Quantity))
        console.log('ProductId : ',id);
        if (error) {
            const product =await productDb.findOne({_id:objectId(id)})
            const brand =await brandDb.find()
            const cate =await categoryDb.find()
                res.render('admin/product_update',{error:error.details[0].message,product,cate,brand})

        }else{
        productDb.updateOne({_id:id},{$set: product })
        .then(()=>{
            res.redirect('/admin-products')
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
        res.redirect('/admin-products')
    })
}


// ==================================================================================================
// ==================================================================================================

exports.productDetails = async (req,res)=>{
    image = req.query.image.split(',')
    const products = await productDb.findOne({Image:image})
    let cartCount = 0
            let cart = await cartDb.findOne({user:req.session.user?._id})
            console.log('cart',cart);
            if (cart) {
                cartCount = cart.products.length
            }
    res.render('user/product_details',{image:image, products,cartCount,isUserLogin:req.session.isUserLogin})
}