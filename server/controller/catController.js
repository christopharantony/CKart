var categoryDb = require('../model/categoryModel');
const productDb = require('../model/productModel');
const orderDb = require('../model/orderModel');

exports.create =async (req,res)=>{
    try{
        if (!req.body.name){
            res.render('admin/add_category',{error:"Enter the Name of the Category"})
        }else{
            const category = new categoryDb({
                name:req.body.name,
            })
            await category.save()
            res.redirect('/category')
        }
        }catch (error) {
            res.status(400).send(error)
    }
}

exports.updatepage =async (req,res)=>{
    console.log(req.query.id);
    const cate = await categoryDb.findOne({_id:req.query.id})
    res.render('admin/category_update',{error:"",cate})
}

exports.update = async (req,res)=>{
    const id = req.params.id;
    if(!req.body.name){
        const cate = await categoryDb.findOne({_id:id})
        res.render('admin/category_update',{error:"Enter the name of the Category",cate})
    }else{
    const cat = await categoryDb.findOne({_id:id})
    await categoryDb.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
    await productDb.updateMany({"Category":cat.name},{$set : {"Category":req.body.name}})
        res.redirect('/category')
    }
}

exports.delete = async (req,res)=>{
    const id = req.params.id;
    const cat = await categoryDb.findOne({_id:id}) 
    await categoryDb.findByIdAndDelete(id)
    const products = await productDb.find({"Category":cat.name})
    await productDb.deleteMany({"Category":cat.name})
    // for (const product of products){
    //     console.log("Product ID : ",product._id);
    //     await orderDb.deleteMany({"Category":cat.name})
    // }
    res.redirect('/category')
}