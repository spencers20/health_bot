const express=require('express')
const router=express.Router()
const {getdb}=require('../config/database')
const { ObjectId } = require('mongodb')
const Groq=require('groq-sdk')


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
// this url takes you to the symptom checker
router.get('/symptomchecker',async(req, res)=>{
    // await gettips()
    // setInterval(gettips,10000)
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

// route to history
router.get('/historyentry',async(req, res)=>{
    const db=await getdb()
    const users=db.collection('users')
    const userId=req.user.googleId
    const details=await users.findOne({googleId:userId})

    if(!details){  
        throw new Error("no user found")
    }
    console.log(details)

    res.render('history.ejs',{user : req.user}) 
})


router.get('/checkhistory', async(req, res)=>{
    try{
        const db = await getdb()
        const users=db.collection('users')
        const userId=req.user.googleId
        const details=await users.findOne({googleId:userId})

        if(!details){
            throw new Error("no user found")
        }

        res.render('entries.ejs',{user : req.user})

    }catch(e){
        error(`error in getting history ${e}`)


    }
})

router.get('/myhistory',async(req,res)=>{
    try{
        const db=await getdb()
        const collection=db.collection('history')
        const userId=req.user.googleId

        const history=collection.aggregate([
            {
                $match:{_id:userId}
            },
            {
                $unwind:"$histories"
            },
            {
                $sort:{"histories.date":-1}
            },
            {
                $group:{
                    _id:"_id",
                    histories:{
                        $push:{
                            date:"$histories.date",
                            tittle:"$histories.tittle",
                            description:"$histories.description",
                            summary:"$histories.summary"
                        }
                    }
                }
            }
        ])

        if (history) {
            res.status(200).json(history)
        }
        

    }catch(e){

    }
})


//function to send the payload to flowise
async function sendToFLowise(flowisedata){
    try{

        console.log('making call to flowise...')
        console.log(flowisedata)
        const response = await fetch(
                "http://20.4.189.12:3000/api/v1/prediction/45f5a627-3b9d-4f90-a7df-597c1729b0f1",
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
        
    } catch(e){
        console.error(` flowise  error : ${e}`)
    }
    
}

//get summaries from the users input
async function getsummary(message){
    const  groq = new Groq({api_key:process.env.GROQ_API_KEY})
    try{

        const chatCompletions=await groq.chat.completions.create({
            messages :[
                {
                    role:"user",
                    content:`You are a health assistant ;given the following text: ${message}  generate a brief 1 sentence only summary of the text`
                            `do not suggest any possible cause / possible disease for the text. just give a summary of the text`
                            `start with phrases like "you are experiencing...", "you were feeling...", "you have been feeling..." or other related phrases`
                }
            ],
            model:"llama-3.3-70b-versatile",
            temperature:4,
        })
        console.log(`chatCompletions: ${chatCompletions}`)

        const summary=chatCompletions.choices[0]?.message?.content || "No summary found"

        return summary
    } catch(e){
        console.log(`error in generating summaries ${e}`)
    }


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
        const summary=await getsummary(message)//get summary

    
        //saving the new chat in a database
        const chattoadd={
            chatId:results.chatId,
            chatMessageId:results.chatMessageId,
            messages:[
                {
                    conversation:[
                        {
                            symptomquestion:results.question,
                            response:results.text,
                            summary:summary,
                        
                        } ,
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
        const summary=await getsummary(message)
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
                    symptomquestion:results.question,
                    response:results.text,
                    summary:summary,
                
                } ,
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

router.put('/newchat',
    async(req,res)=>{
        try{
            console.log('reseting activeChatId...')
            const db=await getdb()
            const data=db.collection('data')
            const userId=req.user.googleId
            const activechatId=await data.countDocuments({
                _id:userId,
                activechatId:{$exists:true}
            })

            if (activechatId>0){
                await data.updateOne(
                    {_id:userId},
                    {$set :{activechatId:null}})
                
                console.log('chat reset successfully')
                res.status(200).json({message:"chat reset successfully"})
                }
                
            
        } catch(e){
            console.log('reseting activeChatId error',e)
        }
    }
)

router.get('/gethistory', async(req, res)=>{
    try{

        const db=await getdb()
        const data=db.collection('data')
        const userchats=await data.findOne(
            {_id:req.user.googleId}
        ). sort({createAt:-1}).toArray()
        console.log(userchats)
        res.status(200).json(userchats)
    }catch(e){
        console.error(`error in getting history ${e}`)
    }

})



router.post('/storehistory', async(req, res)=>{
    try{
        console.log('storing history...')
        const db=await getdb()
        const history=db.collection('history')
        const {tittle, description}=req.body
        const message=description
        console.log(`messages: ${message}`)
        const summary=await getsummary(message)
        const userId=req.user.googleId

        const objectId=await history.findOne({
            _id:userId
        })

        if (!objectId){
            await history.insertOne({_id:userId})
        }
        const date=new Date()

        const result=await history.bulkWrite ([
            {
                updateOne:{
                   filter:{_id:userId},
                   update:{
                    $push:{
                        histories :[{
                            date:date,
                            tittle:tittle,
                            description:description,
                            summary:summary
                    }]
                    }
                   }
                }

            }
        ])

        if (result.acknowledged){
            console.log('history stored successfully')
        }

        // console.log('history stored successfully')
        res.status(200).json({message:"history stored successfully"})

        

        


    }
    catch(e){
        console.error(`error in storing history ${e}`)
    }
})

module.exports = router
