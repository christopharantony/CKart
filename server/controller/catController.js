var categoryDb = require('../model/categoryModel');
const productDb = require('../model/productModel');

exports.create =async (req,res)=>{
    try{
        const category = new categoryDb({
            name:req.body.name,
        })
        await category.save()
        res.redirect('/category')
    }catch (error) {
        res.status(400).send(error)
    }
}

exports.updatepage =async (req,res)=>{
    console.log(req.query.id);
    const cate = await categoryDb.findOne({_id:req.query.id})
    res.render('admin/category_update',{cate})
}

exports.update = async (req,res)=>{
    const id = req.params.id;
    const cat = await categoryDb.findOne({_id:id})
    await categoryDb.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
    await productDb.updateMany({"Category":cat.name},{$set : {"Category":req.body.name}})
        res.redirect('/category')
}

exports.delete = async (req,res)=>{
    const id = req.params.id;
    const cat = await categoryDb.findOne({_id:id})
    await categoryDb.findByIdAndDelete(id)
    await productDb.deleteMany({"Category":cat.name})
    res.redirect('/category')
}