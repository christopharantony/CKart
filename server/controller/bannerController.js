const bannerDb = require('../model/bannerModel')

exports.create =async (req,res)=>{
    try{
        const banner = new bannerDb({
            description:req.body.description,
        })
        await category.save()
        res.redirect('/category')
    }catch (error) {
        res.status(400).send(error)
    }
}