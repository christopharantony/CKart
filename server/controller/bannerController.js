const Joi = require('joi')
const bannerDb = require('../model/bannerModel')
const objectId = require('mongoose').Types.ObjectId

exports.showBanner = async (req,res) => {
    try {
        const banner = await bannerDb.find()
        res.render('admin/banner',{banner})
    } catch (error) {
        log.error(error)
        res.send(error.message)
    }
    
}

exports.addBanner = async (req, res) => {
    try {
            if (!req.files){
                res.redirect('/admin/bannerAddErr')
            }else{
            let image = req.files?.Image
            var uploadPath = './public/productsImg/' + Date.now()+'.jpeg'
            var imgPath ='productsImg/' + Date.now()+'.jpeg'
            console.log(image);
            image?.mv(uploadPath,(err)=>{
                if (err) {
                    log.error(err)
                    res.send(err.message)
                }
            })
            const bannerObj = {
                label:req.body.label,
                description:req.body.description,
                image:imgPath
            }
            const banner = new bannerDb(bannerObj);
            await banner.save()
            res.redirect('/admin/banner')
        }
    } catch (error) {
        res.send(error.message)
    }
}


exports.updatePage = async (req, res)=>{
    const banner = await bannerDb.findOne({_id:objectId(req.query.id)})
    res.status(200).render('admin/banner_update',{banner,error:""})
}

exports.update = async (req, res)=>{
    const id = objectId(req.params.id);
    let image = req.files?.Image;
    if (image){
        var uploadPath = './public/productsImg/' + Date.now()+'.jpeg'
        var imgPath ='productsImg/' + Date.now()+'.jpeg'
        image.mv(uploadPath);
        }
    const banner = {
        label:req.body.label,
        description:req.body.description,
        image:imgPath
    }
    bannerDb.updateOne({_id: id},{$set: banner})
    .then(()=>{
        res.redirect('/admin/banner')
    })
}

exports.deleteBanner = async (req,res)=>{
    const id = req.params.id;
    await bannerDb.findByIdAndDelete(id)
    res.redirect('/admin/banner')
}