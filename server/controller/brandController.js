var brandDb = require('../model/brandModel');

exports.create =async (req,res)=>{
    try{
        const brand = new brandDb({
            name:req.body.name,
        })
        await brand.save()
        res.redirect('/brand')
    }catch (error) {
        res.status(400).send(error)
    }
}

exports.updatepage =async (req,res)=>{
    console.log(req.query.id);
    const brand = await brandDb.findOne({_id:req.query.id})
    res.render('brand_update',{brand})
}

exports.update = async (req,res)=>{
    const id = req.params.id;
    await brandDb.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
        res.redirect('/brand')
}

exports.delete = async (req,res)=>{
    const id = req.params.id;
    await brandDb.findByIdAndDelete(id)
    res.redirect('/brand')
}