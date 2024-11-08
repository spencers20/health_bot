const express=require('express')
const router=express.Router()
const {getdb}=require('../config/database')
const { ObjectId } = require('mongodb')


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
    async (req , res,next)=>{
        try{
            const db=await getdb()
            const data=db.collection('data')
            const{ message}=req.body
            async function sendToFLowise(flowisedata){
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
                return result
                
                
            }
            const objectid=await data.findOne({
                _id:req.user.googleId
            })

            if (!objectid){
                const flowisedata={
                    question:message
                }
                
                const results=await sendToFLowise(flowisedata)

                const log={
                    _id:req.user.googleId,
                    chats:[
                        {
                            chatId:results.chatId,
                            chatMessageId:results.chatMessageId,
                            messages:[
                                {
                                    onechat:[
                                        {
                                            type:'human',
                                            content: results.question
                                        },
                                        {
                                            type:'ai',
                                            content:results.text

                                        },
                                        {
                                            chattime:new Date()
                                        }
                                    ]
                                }
                            ],
                            createdAt : new Date(),
                            updatedAt :new Date ()
                        }
                    ]
                }

                const inserttodb=await data.insertOne(log)
                if(inserttodb.acknowledged){
                    console.log('added successfully')
                }

                next()
            } 

            const results=await sendToFLowise(flowisedata)
            const chatId = await data.findOne()

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

