var Userdb = require('../model/model');
const productDb = require('../model/productModel')

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

exports.mobileNum = async (req, res) => {
    const user = await Userdb.findOne({number:req.body.number})
    console.log('------------- Number in Body: ',req.body.number,'----------Number in database : ',user)
    if (user){
        if (user.status){
            res.render('user_loginotp',{error:"Your account is blocked"})
        }
        console.log("number", req.body.number);
    client.verify
        .services(serviceSid)
        .verifications.create({
            to: `+91${req.body.number}`,
            channel: "sms"
        })
        .then((resp) => {
            console.log("response ", resp);
            res.status(200).render("user_login-otp",{error:false,number:req.body.number});
        });
    }else{
        res.render('user_loginotp',{error:"This Number is not registered"})
    }
    
}

exports.otp = (req, res) => {
    const otp = req.body.otp;
    console.log("otp", otp);
    client.verify
        .services(serviceSid)
        .verificationChecks.create({
            to: `+91${req.body.number}`,
            code: otp,
        })
        .then((resp) => {
            
            console.log("response ", resp);
            if (resp.valid) {
                productDb.find()
                .then((products)=>{
                    res.status(200).render('Home',{products});
                })
                
            }else{
                res.render('user_login-otp',{error:true,number:req.body.number});
            }
            
        });
}

exports.resend = (req,res)=>{
        client.verify
            .services(serviceSid)
            .verifications.create({
                to: `+91${req.body.number}`,
                channel: "sms"
            })
            .then((resp) => {
                console.log("response ", resp);
                res.status(200).render("user_login-otp",{error:false,number:req.body.number});
            });
        
    console.log('*******************    req.body.number',req.body.number);
    // console.log('*******************    number',number); number is not defined

    // client.verify
    //     .services(serviceSid)
    //     .verifications.create({
    //         to: `+91${req.body.number}`,
    //         channel: "sms"
    //     })
    //     .then((resp) => {
    //         console.log("response ", resp);
    //         res.status(200).render("user_login-otp",{error:false,number:req.body.number});
    //     });
}