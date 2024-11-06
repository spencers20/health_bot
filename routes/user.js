const express=require('express')
const router=express.Router()
const {getdb}=require('../config/database')


router.use( async (req, res,next)=>{
    if (req.isAuthenticated){
        next()
    } else{
        res.status.send('user unauthenticated')
    }
})

router.use(express.json())

router.get('/',
    async (req , res)=>{
        console.log(req.user)
        const db= await getdb()
        const users=db.collection('users')

        const details=await users.findOne({googleId:req.user.googleId})

        if(!details){
            throw new Error("no user found")
        }
        console.log(details)

        res.render('chat.ejs',{user : req.user})
    }
)

router.post('/chat',
    async (req , res)=>{
        try{
        const{ message}=req.body
        const flowisedata={
            question:message,
            chatId:'2244fb1a-03ba-492b-ae8e-de9a9823eb91',
        }

        const response = await fetch(
            "http://20.86.249.39:3000/api/v1/prediction/45f5a627-3b9d-4f90-a7df-597c1729b0f1",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(flowisedata)
            }    
        );
        const result = await response.json()

        const sessiondata={
            userId:req.user.googleId,
            SessionId:result.sessionId,
            chatId:result.chatId,
            chatMessageId:result.chatMessageId,
            messages:[
                {type:"human", content:result.question},
                {type:"ai", content:result.text}
            ],
            createdAt:new Date(),
            updatedAt:new Date()
        }
        
        const db=await getdb()
        const data=db.collection('data')
        const added =await  data.insertOne(sessiondata)
        if (added.acknowledged){
            console.log("data added succesfully")
            alert(`done , data added to database successfully`)
        }

       }catch(e){
        console.log({chat_error:`${e}`})
       }

    }
)

module.exports = router

