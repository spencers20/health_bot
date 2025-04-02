const express=require('express')
const { isAuthenticated } = require('../middleware/auth')
const router=express.Router()

router.use(isAuthenticated)
router.use(express.json())

router.get('/',async(req,res)=>{
    try{
        const admin=req.session.admin
        res.render('admin.ejs',{admin})

    }catch(e){
        console.error('error in getting to admin page')
    }
})

router.get('/admindetails',async(req,res)=>{
    try{
      const admin=req.session.admin
      res.status(200).json(admin)
    }catch(e){
        console.error('errror in getting admin details')
    }
})

router.get('/logout',async(req,res)=>{
    try{
        delete req.session.admin
        res.render('index.ejs')

    }catch(e){
        console.error('error in logging out admin')
    }
})



module.exports=router