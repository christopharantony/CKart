var Userdb = require('../model/model');

const admin = {
    email:'admin@gmail.com',
    password:'admin123'
}

// SignUp
exports.Create = (req,res)=>{
    if(!req.body){
        res.status(400).send({ message :"Content can not be empty!"});
        return;
    }else{
            const user = new Userdb({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password,
                gender:req.body.gender,
                status:req.body.status
            });
            if (user.password.length>7) {
                user.save(user)
            .then(()=>{
                res.status(201).render('user_login',{error:false})
            })
            .catch(err=>{
                console.log(err.message);
                res.status(401).render('user_signup',{error:"Account already in use"})
            })
            } else {
                res.render('user_signup',{error:"Password must contain atleast 8 characters"})
            }
            
        }
}

// User Login
exports.Find = async(req,res)=>{
    userDb = await Userdb.findOne({email:req.body.email,password:req.body.password})
    if (userDb) {
        
        req.session.user=req.body.email;
        req.session.isUserLogin = true;
        console.log(userDb);
        // res.render('user_home',{name:userDb.name})
        res.status(200).render('Home')
    }else{
        res.render('user_login',{error:true})
    }
}

// Create and Save new user

exports.create = (req,res)=>{
    const user = new Userdb({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        gender:req.body.gender,
        status:req.body.status
    });
    console.log(user);
    console.log(user.password.length);
    if (user.password.length>7) {
        user.save(user)
    .then(()=>{
        res.render('add_user',{error:""})
    })
    .catch(err=>{
        console.log(err.message);
        res.render('add_user',{error:"Account is already in use"})
        
    })
    } else {
        res.render('add_user',{error:"Password must contain at least 8 characters"})
    }
    
}

// Admin Home

exports.find = (req,res)=>{
    Userdb.find()
    .then(data=>{
        if(req.session.isAdminLogin){
            res.status(200).render('admin_home',{users:data})
        }else{
            if (req.body.email===admin.email&&req.body.password===admin.password) {
                req.session.admin=req.body.email;
                req.session.isAdminLogin=true;
                res.status(200).render('admin_home',{users:data})
            }else{
                res.status(401).render('admin_login',{error:"Invalid Username or Password"})
            }
        }
    })
    .catch(err=>{
        console.log(err.message);
    })
}

// Search user

exports.search = (req,res)=>{
    
    Userdb.find({
        name:new RegExp(req.query.searchName,"i")
    })
    .then(data=>{
        res.render('admin_home',{users:data})
    })
}

// Update Page

exports.updatepage = (req,res)=>{
    console.log(req.query.id);
    Userdb.findOne({_id:req.query.id})
    .then(data=>{
        res.render('admin_update',{user:data})
    })
}

// Update User
exports.update = (req,res)=>{
    const id = req.params.id;
    Userdb.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
    .then(data=>{
        res.redirect('/admin')
    })
}

// Delete User
exports.delete = (req,res)=>{
    const id = req.params.id;
    Userdb.findByIdAndDelete(id)
    .then(data=>{
        res.redirect('/admin')
    })
}

    // New User
    exports.create = (req,res)=>{
        if(!req.body){
            res.status(400).send({ message :"Content can not be empty!"});
            return;
        }else{
        const user = new Userdb({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        gender: req.body.gender,
        status:req.body.status
    });

    user.save(user)
    .then(()=>{
        res.redirect('/')
    })
    .catch(err=>{
        console.log(err.message);
        res.status(401).render('admin_login',{error:"Invalid Input"})
    });
}
}



// // Return all users / Single User

// exports.find = async(req,res)=>{
//     userDb = await userDb.findOne({email:req.body.email,password:req.body.password})
//     if(userDb) {

//         req.session.user=req.body.email;
//         req.session.isUserLogin = true;
//         req.render('user_home',{name:userDb.name})
//     }else{
//         res.render('user_login',{error:"true"})
//     }
