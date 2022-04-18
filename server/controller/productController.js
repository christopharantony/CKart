var productDb = require('../model/productModel')
var categoryDb = require('../model/categoryModel')
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
        Category:req.body.Category,
        Image:imgPath
        
    });
        product.save(product)
// console.log(req.body)
// console.log(product);

// console.log(image);
// var uploadPath = path.resolve(__dirname,'../public/productsImg/',image.name)
// var uploadPath = './public/productsImg/' + image.name




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
exports.updatepage = (req,res)=>{
    console.log(req.query.id);
    productDb.findOne({_id:req.query.id})
    .then(data=>{
        categoryDb.find()
        .then(category=>{
            console.log(category);
            res.render('product_update',{product:data,cate:category})
        })
        
    })
}
//  Edit Product
exports.update = (req,res)=>{
    const id = req.params.id;
    productDb.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
    .then(data=>{
        res.redirect('/admin_products')
    })
}

// ------------------- Delete Product -----------------------------

exports.delete = (req,res)=>{
    const id = req.params.id;
    productDb.findByIdAndDelete(id)
    .then(data=>{
        res.redirect('/admin_products')
    })
}