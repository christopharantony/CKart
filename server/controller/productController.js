var productDb = require('../model/productModel')
const path = require('path');

// New Product
exports.create = (req,res)=>{
    if(!req.body){
        res.status(400).send({ message :"Content can not be empty!"});
        return;
    }else{
    const product = new productDb({
    Name:req.body.Name,
    Price:req.body.Price,
    Quantity:req.body.Quantity,
    Description: req.body.Description,
    Category:req.body.Category
});
// console.log(req.body)
// console.log(product);
let image = req.files.Image
// console.log(image);
// var uploadPath = path.resolve(__dirname,'../public/productsImg/',image.name)
var uploadPath = './public/productsImg/' + image.name
image.mv(uploadPath,(err,done)=>{
    console.log(uploadPath);
    if(err){
        console.log(err);
        return res.status(500).send(err);
    }
        product.save(product)

    .then((data)=>{
        // console.log(data);
        res.redirect('/admin_product')

    })
    .catch(err=>{
        console.log(err.message);
    // res.status(401).render('admin_login',{error:"Invalid Input"})
    });
        
    })

}
}