var categoryDb = require('../model/categoryModel');

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
    await categoryDb.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
        res.redirect('/category')
}

exports.delete = async (req,res)=>{
    const id = req.params.id;
    await categoryDb.findByIdAndDelete(id)
    res.redirect('/category')
}