const productDb = require('../model/productModel')
const categoryDb = require('../model/categoryModel')
const brandDb = require('../model/brandModel')

const path = require('path');

// New Product
exports.create = (req,res)=>{
    if(!req.body){
        res.status(400).send({ message :"Content can not be empty!"});
        return;
    }else{
        let image = req.files.Image
        var uploadPath = './public/productsImg/' + Date.now()+'.jpeg'
        var imgPath ='productsImg/' + Date.now()+'.jpeg'

image.mv(uploadPath,(err)=>{
    console.log(uploadPath);
    if(err){
        console.log(err);
        return res.status(500).send(err);
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
        res.redirect('/admin_products')

    })
    .catch(err=>{
        console.log(err.message);
    // res.status(401).render('admin_login',{error:"Invalid Input"})
    });
        
    })

}
}

exports.find = (req,res)=>{
    productDb.find()
    .then(data=>{
        // console.log(data);
        res.status(200).render('admin_products',{products:data})
    })
    .catch(err=>{
        console.log(err.message);
    })
}

// ------------------- Edit Product ----------------------------
//  Edit Page
exports.updatepage = async(req,res)=>{
    console.log(req.query.id);
        const product =await productDb.findOne({_id:req.query.id})
        const brand =await brandDb.find()
        const cate =await categoryDb.find()
            console.log(`Brand : ${brand} Category: ${cate}`);
            res.render('product_update',{product,cate,brand})
        

}
//  Edit Product
exports.update = (req,res)=>{
    const id = req.params.id;
        let image = req.files?.Image
        if(image){
            var uploadPath = './public/productsImg/' + Date.now()+'.jpeg'
        var imgPath ='productsImg/' + Date.now()+'.jpeg'
        image.mv(uploadPath)
        }
    
    const product = {
        Name:req.body.Name,
        Price:req.body.Price,
        Quantity:req.body.Quantity,
        Description: req.body.Description,
        Brand: req.body.Brand,
        Category:req.body.Category,
        Image:imgPath
        
    };

    console.log(typeof(product.Quantity),'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    console.log(id,'this is udddd');

    productDb.updateOne({_id:id},{$set: product })
    .then(()=>{
        res.redirect('/admin_products')
        
    })
}
// )}

// ------------------- Delete Product -----------------------------

exports.delete = (req,res)=>{
    const id = req.params.id;
    productDb.findByIdAndDelete(id)
    .then(()=>{
        res.redirect('/admin_products')
    })
}