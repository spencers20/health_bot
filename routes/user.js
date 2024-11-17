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
        const userId=req.user.googleId

        const details=await users.findOne({googleId:userId})

        if(!details){
            throw new Error("no user found")
        }
        console.log(details)

        res.render('chat.ejs',{user : req.user})
    }
)

router.get('/symptomchecker',async(req, res)=>{
    const db=await getdb()
    const users=db.collection('users')
    const userId=req.user.googleId
    const details=await users.findOne({googleId:userId})

    if(!details){
        throw new Error("no user found")
    }
    console.log(details)

    res.render('symptom.ejs',{user : req.user})

})



//function to send the payload to flowise
async function sendToFLowise(flowisedata){
    console.log('making call to flowise...')
    console.log(flowisedata)
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
    console.log('results:',result)
    return result
    
    
}
//function to get new chatId and save to db for every new chat
async function startnewchat(userId,message){
    try{

        console.log("starting a new chat....")
        //payload to be sent to flowise without chatId
        const flowisedata={
            question:message
        }
        const results=await sendToFLowise(flowisedata)
    
        //saving the new chat in a database
        const chattoadd={
            chatId:results.chatId,
            chatMessageId:results.chatMessageId,
            messages:[
                {
                    conversation:[
                        {
                            role:"human",
                            content:results.question,
                        
                        } ,
                        {
                            role:"ai",
                            content:results.text,
                            
                        },
                        {
                            chattime:new Date()
                        }]
                }],
            createdAt:new Date(),
            updatedAt:new Date()
            }
            
        const db=await getdb()
        const data=db.collection('data')
        const result=await data.bulkWrite([
            {
                updateOne:{
                    filter:{
                        _id:userId
                    },
                    update:{
                        $set:{activechatId:results.chatId},
                        $push:{chats:chattoadd}
                    }
                }
            }
        ])
        if (result.acknowledged){
            console.log("added to the database successfully")
        }
    
        return results
    }catch(e){
        console.error(`starting new chat error: ${e}`)
    
    }


}

//function of every new conversation 
async function conversations(userId,message){
    try{

        console.log("starting a new conversation....")
        //calling the database function
        db=await getdb()
        const data=db.collection('data')

        const activechatId=await data.findOne({
            _id:userId,
            'activechatId':{$exists:true}
        })

        console.log('existing active chatId',activechatId.activechatId)
        const chatId=activechatId.activechatId
        //payload to be sent to flowise with a chatId
        const flowisedata={ 
            question:message,
            chatId:chatId
        }
        const results=await sendToFLowise(flowisedata)
    
  
    
     //checking the existence of a chatId in the database
        const findchatId=await data.findOne({
            _id:userId,
            'chats.chatId':chatId
        })
    //throw an error if no chatId is found
        if (!findchatId){
            throw new Error({chatIderror:"chatId not found"})
        }
    //save the new conversation to the db
        const newconversation={
            conversation:[
                {
                    role:"human",
                    content:results.question,
                
                } ,
                {
                    role:"ai",
                    content:results.text,
                    
                },
                {
                    chattime:new Date()
                }
            ],
          
        }
    //update the messages in the db
        const result=await data.bulkWrite([{
            updateOne:{
                filter:{
                    _id:userId,
                    'chats.chatId':chatId
                },
                update:{
                    $push:{'chats.$.messages':newconversation},
                    $set:{'chats.$.updatedAt':new Date()}
    
                }
            }
        }])
    
        if (result.acknowledged){
            console.log('conversation saved')
      
    }
    
        return results 
    }catch(e){
        console.error(`error in new conversation :${e}`)
    }
}


router.post('/chat',
    async (req , res)=>{
        try{
            const db=await getdb()
            const data=db.collection('data')
            const{ message}=req.body
            const userId=req.user.googleId
            console.log(userId)
            let flowiseResponse
          
            //check if the user had a conversation before
            const objectid=await data.findOne({
                _id:userId
            })
// if not then save the user to the database and initialize them with a new chat
            if (!objectid){
                const newuser=data.insertOne({_id:userId})

                if (newuser.acknowledged){
                flowiseResponse=await startnewchat(userId,message)
                }   
            }
            // check if theres an active chatId existing in the database
            const activechatId=await data.countDocuments({
                _id:userId,
                activechatId:null
            })
// if theres an activechatId  call the conversations function , if not then call the startnewchat function
            if (activechatId > 0){
                flowiseResponse=await startnewchat(userId,message)
            } else {

               flowiseResponse= await conversations(userId,message)

            }
            

            res.status(200).json(flowiseResponse)
            // return flowiseResponse
            
       }catch(e){
        console.log({chat_error:`${e}`})
       }
      
    }
    

    
)

module.exports = router
