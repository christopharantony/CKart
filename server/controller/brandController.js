var brandDb = require('../model/brandModel');
const productDb = require('../model/productModel')


exports.create =async (req,res)=>{
    try{
        if (!req.body.name){
            res.redirect('/admin/BrandErr')
        }else{
            const brand = new brandDb({
                name:req.body.name,
            })
            await brand.save()
            res.redirect('/admin/brand')
        }
    }catch (error) {
        res.status(400).send(error)
    }
}

exports.updatepage =async (req,res)=>{
    const brand = await brandDb.findOne({_id:req.query.id})
    res.render('admin/brand_update',{error:"",brand})
}

exports.update = async (req,res)=>{
    const id = req.params.id;
    if (!req.body.name){
        req.session.brandId = id;
        res.redirect('/admin/editBrandErr')
    }else{
    const brand = await brandDb.findOne({_id:id}) 
    await brandDb.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
    await productDb.updateMany({"Brand": brand.name},{$set:{"Brand": req.body.name}})
        res.redirect('/admin/brand')
    }
}

exports.delete = async (req,res)=>{
    const id = req.params.id;
    const brand = await brandDb.findOne({_id:id})
    await brandDb.findByIdAndDelete(id)
    await productDb.deleteMany({"Brand": brand.name})
    res.redirect('/admin/brand')
}