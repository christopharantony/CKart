const productDb = require('../model/productModel')
const categoryDb = require('../model/categoryModel')
const brandDb = require('../model/brandModel')
const cartDb = require('../model/cartModel')

const path = require('path');

// --------------------------------------------- New Product -----------------------------------------------
exports.create = (req,res)=>{
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
            image.mv(uploadPath,(err)=>{
            console.log(uploadPath);
            if(err){
                console.log(err);
                return res.status(500).send(err);
            }
            })
            }
            console.log('imgPath',imgPath);
        }
        
    const product = new productDb({
        Name:req.body.Name,
        Price:req.body.Price,
        Quantity:req.body.Quantity,
        Description: req.body.Description,
        Brand: req.body.Brand,
        Category:req.body.Category,
        Image:imgPath
        
    });
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
            console.log(`Brand : ${brand} Category: ${cate}`);
            res.render('admin/product_update',{product,cate,brand})
}
//  Edit Product
exports.update = (req,res)=>{
    const id = req.params.id;
    let images = []
        if(req.files?.Image1){images.push(req.files?.Image1)}
        if(req.files?.Image2){images.push(req.files?.Image2)}
        if(req.files?.Image3){images.push(req.files?.Image3)}
    console.log("req.files: " + images);
    console.log("Images.length",images.length);
    const imgPath = []
    if(images.length){
        for (let i = 0; i < images.length; i++) {
        var uploadPath = './public/productsImg/' + Date.now()+i+'.jpeg'
        var img ='productsImg/' + Date.now()+i+'.jpeg'
        imgPath.push(img)
        images[i]?.mv(uploadPath,(err)=>{
        console.log(uploadPath);
        if(err){
            console.log(err);
            return res.status(500).send(err);
        }
        })
        }
        console.log('imgPath',imgPath);

        const product = {
            Name:req.body.Name,
            Price:req.body.Price,
            Quantity:req.body.Quantity,
            Description: req.body.Description,
            Brand: req.body.Brand,
            Category:req.body.Category,
            Image:imgPath
            
        };
        console.log('Type of Product : ',typeof(product.Quantity))
        console.log('ProductId : ',id);
        productDb.updateOne({_id:id},{$set: product })
        .then(()=>{
            res.redirect('/admin-products')
        })
        .catch(err=>{
            res.send(err.message)
        })
    }else{
        const product = {
            Name:req.body.Name,
            Price:req.body.Price,
            Quantity:req.body.Quantity,
            Description: req.body.Description,
            Brand: req.body.Brand,
            Category:req.body.Category            
        };
        console.log('Type of Product : ',typeof(product.Quantity))
        console.log('ProductId : ',id);
        productDb.updateOne({_id:id},{$set: product })
        .then(()=>{
            res.redirect('/admin-products')
        })
        .catch(err=>{
            res.send(err.message)
        })
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
        console.log('req.query.image',(req.query.image.split(',')));
        console.log("==============>",image,products,cartCount);
    res.render('user/product_details',{image:image, products,cartCount,isUserLogin:req.session.isUserLogin})
}