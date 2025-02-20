const express=require('express')
const router=express.Router()
const {getdb}=require('../config/database')
const { ObjectId } = require('mongodb')
const Groq=require('groq-sdk')
const PDFDocument =require('pdfkit')
const fs=require('fs')
const { group } = require('console')
const cron=require('node-cron')



router.use( async (req, res,next)=>{
    if (req.isAuthenticated()){
        next()
    } else{
        res.status.send('user unauthenticated')
    }
})

router.use(express.json())

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
        if(result.success==false){
            console.Error(' call to flowise failed')
        } else{
            console.log("success result ",result)
            return result
        }
        
    } catch(e){
        console.error(` flowise  error : ${e}`)
    }
    
}

//get summaries from the users input
async function querymodel(instruction){
    const  groq = new Groq({api_key:process.env.GROQ_API_KEY})
    try{

        const chatCompletions=await groq.chat.completions.create({
            messages :[
                {
                    role:"user",
                    content: instruction
                }
            ],
            model:"llama-3.3-70b-versatile",
            temperature:1,
        })
        console.log(`chatCompletions: ${chatCompletions}`)

        const summary=chatCompletions.choices[0]?.message?.content || "No summary found"

        return summary
    } catch(e){
        console.log(`error in generating summaries ${e}`)
    }


}

function containsnull(obj){
    try{

        let isNull=false
    
        function findnulls(obj,path=''){
            if(Array.isArray(obj)){
                obj.forEach((item,index)=>{
                    const Newpath=`${path}[${index}]`
                    if(item=== null || item===" "){
                        isNull=true
                        console.log(`null value at ${Newpath}`)
                    }else if(typeof item==="object" && item !==null ){
                         findnulls(item,Newpath)
                    }
                })
            } else if( typeof obj==='object' && obj!== null){
                for (const key in obj){
                    const Newpath=`${path}.${key}`
                    findnulls(obj[key],Newpath)
                }
            }else{
                if(obj===null || obj ===""){
                    isNull=true
                }
            }
        }
    
        findnulls(obj)
    
        return isNull 
    } catch(e){
        console.log('errror in finding null',e)

    }
    
}


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
        console.log(JSON.stringify(details, null, 2))

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
    console.log(JSON.stringify(details, null, 2))

    res.render('symptom.ejs',{user : req.user})

})

//function to get new chatId and save to db for every new chat
async function startnewchat(userId,message){
    try{

        console.log("starting a new chat....")
        //payload to be sent to flowise without chatId
        const flowisedata={
            question:message
        }
        const results=await sendToFLowise(flowisedata)
        instruction=`You are a health assistant; given the following text: ${message},generate a brief 1-sentence summary of the text.
                 Do not suggest any possible cause or disease for the text; just give a summary of the text. Start with phrases like "you are experiencing...", "you were feeling...", "you have been feeling...", or other related phrases.`
        const summary=await querymodel(instruction)//get summary

        if (containsnull(results)){
            console.error(`${results} contains null elements`)

        }else{
            //saving the new chat in a database
            const chattoadd={
                    chatId:results.chatId,
                    chatMessageId:results.chatMessageId,
                    messages:[
    
                        {
                            question: results.question,
                            response: results.text,
                            summary:summary,
                            chattime:new Date()
        
                        }
                    ],
                    
                    createdAt:new Date(),
                    updatedAt:new Date()
                }

            if (containsnull(chattoadd)){
                console.error(`${chattoadd} contains null elements`)
            } else{
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
            }
        }

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
        instruction=`You are a health assistant; given the following text: ${message},generate a brief 1-sentence summary of the text. Do not suggest any possible cause or disease for the text; 
                           just give a summary of the text. Start with phrases like "you are experiencing...", "you were feeling...", "you have been feeling...", or other related phrases.`
         const summary=await querymodel(instruction)
        const results=await sendToFLowise(flowisedata)
    
  
    
     //checking the existence of a chatId in the database
    //  const findchatId = await data.findOne({
    //     _id: userId,
    //     chats: {
    //         $elemMatch: {
    //             chatId: chatId
    //         }
    //     }
    // });
    // //throw an error if no chatId is found
    //     if (!findchatId){
    //         throw new Error(JSON.stringify({chatIderror:"chatId not found"}))
    //     }
    //save the new conversation to the db
    if (containsnull(results)){
        console.error(`${results} contains null elements`)

    }else{
    
        const newconversation={
            question:results.question,
            response:results.text,
            summary:summary,
            chattime: new Date()
          
        }

        if(containsnull(newconversation)){
            console.error(`${newconversation} contains null elements`)

        }else{ 
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
}
    }
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
                data.insertOne({_id:userId})
                flowiseResponse=await startnewchat(userId,message)
            
            } else{
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

            }
            // check if theres an active chatId existing in the database
            
            

            res.status(200).json(flowiseResponse)
            // return flowiseResponse
            
       }catch(e){
        console.log({chat_error:`${e}`})
       }
      
    }
    

    
)

// route to enter history
router.get('/historyentry',async(req, res)=>{
    const db=await getdb()
    const users=db.collection('users')
    const userId=req.user.googleId
    const details=await users.findOne({googleId:userId})

    if(!details){  
        throw new Error("no user found")
    }
    console.log(JSON.stringify(details, null, 2)) 

    res.render('entries.ejs',{user : req.user}) 
})

// route to check the history of your entries ..entries.ejs
router.get('/checkhistory', async(req, res)=>{
    try{
        
        const db = await getdb()
        const users=db.collection('users')
        const userId=req.user.googleId
        const details=await users.findOne({googleId:userId})

        if(!details){
            throw new Error("no user found")
        }

        res.render('records.ejs',{user : req.user})

    }catch(e){
        error(`error in getting history ${e}`)
    }
})





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
        ).sort({createAt:-1}).toArray()
        console.log(JSON.stringify(userchats, null, 2))
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

        instruction=`You are a health assistant; given the following text: ${message},generate a brief 1-sentence summary of the text.Do not suggest any possible cause or disease for the text; 
                just give a summary of the text. Start with phrases like "you are experiencing...", "you were feeling...", "you have been feeling...", or other related phrases.`
         const summary=await querymodel(instruction)

        const userId=req.user.googleId

        const objectId=await history.findOne({
            _id:userId
        })

        if (!objectId){
            await history.insertOne({_id:userId})
        }
        const date=new Date()
        const histories={
            date:date,
            tittle:tittle,
            description:description,
            summary:summary
        }         
        
        if (containsnull(histories)){
            console.log(`Null values found in  ${histories}`)
        }else{
            
                    const result=await history.bulkWrite ([
                        {
                            updateOne:{
                               filter:{_id:userId},
                               update:{
                                $push:{
                                    histories :histories
                               }
                               }
                            }
            
                        }
                    ])
            
                    if (result.ok==true){
                        console.log('history stored successfull')
                        res.status(200).json(result)
                    }
            
                    // console.log('history stored successfully')
        }

    }
    catch(e){
        console.error(`error in storing history ${e}`)
    }
})



// funtion to generate a pdf of data required
const generatepdf=(data,res)=>{
    try{
        console.log("generatepdf function entered...")
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No data to generate PDF' });
        }

        console.log('Generating PDF with data:', JSON.stringify(data, null, 2));
        
        const doc = new PDFDocument();
        
        // Set headers on the response object, not the PDF document
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=histories.pdf");
        doc.pipe(res);
    
        doc.fontSize(20).text("Health  History Report", {align: 'center', underline: true}).moveDown(1);
    
        data.forEach((item,index)=>{
            doc.fontSize(16)
                .text(`ID: ${item._id}`,{align:"center"})
                .moveDown(1);

                if(item.chats){
                    item.chats.forEach((chat)=>{
                        doc.fontSize(14)
                        .font('Helvetica-Bold')
                        .text('Summary')

                        doc.fontSize(12)
                        .font('Helvetica')
                        .text(`${chat.summary|| 'No summary'}`)

                        doc.fontSize(14)
                            .font('Helvetica-Bold')
                            .text('conversations')
                        .moveDown(1)

                        chat.messages.forEach((message)=>{
                            const date=new Date(message.chattime).toLocaleDateString()
                            
                            
                            doc.fontSize(13)
                            .font('Courier-Bold')
                            .text(`${date}`,{align:'right'})
                            .text(`${message.question}`,{align:'left'})

                            doc.fontSize(11)
                            .font('Times-Roman')
                            .text(`${message.response}`)
                            .moveDown(1)


                        })
                    })
                } else{
                    item.histories.forEach((history)=>{
                    const date = new Date(history.date).toLocaleDateString();
                        
                    doc.fontSize(14)
                        .text(`Date: ${date}`, {fontWeight: "bold"})
                        .text(`Title: ${history.tittle || 'No title'}`)
                        .text(`${history.description || 'No description'}`)
                        .moveDown(1);
                                });
                }
    
            if (index < data.length - 1) {
                doc.addPage();
            }
        });
    
        doc.end();
        console.log('PDF generation completed');

    } catch(e){
        console.log('error downloading function',e);
        res.status(500).json({ error: 'Error generating PDF' });
    }
}


async function combineddata (req) {
    try{

        const db=await getdb()
        const entries=db.collection('history')
        const chats=db.collection('data')
        const userId=req.user.googleId
        
        const[chatdata,history]=await Promise.all([
        
             await chats.aggregate([
                // Match the document with the specified userId
                { $match: { _id: userId } },
                
                // Unwind the 'chats' array to process each chat object individually
                { $unwind: "$chats" },
                
                // Sort the chats by 'updatedAt' in descending order to get the latest chats first
                { $sort: { "chats.updatedAt": -1 } },
                
                // Add fields to structure the desired output
                {
                  $addFields: {
                    date: "$chats.updatedAt",
                    // Extract the 'question' from the last message as the 'title'
                    tittle: { $arrayElemAt: ["$chats.messages.question", -1] },
                    // Extract the 'response' from the last message as the 'description'
                    description: { $arrayElemAt: ["$chats.messages.response", -1] },
                    // Extract the 'summary' from the last message
                    summary: "$chats.summary",
                    //get the chat id
                    chatId: "$chats.chatId",
                    // Include all messages as 'conversations'
                    conversations: "$chats.messages",
                    status:"$chats.status"
                  }
                },
                
                // Group the processed chats back into an array under 'histories'
                {
                  $group: {
                    _id: userId,
                    histories: {
                      $push: {
                        date: "$date",
                        tittle: "$tittle",
                        description: "$description",
                        summary: "$summary",
                        chatId: "$chatId",
                        conversations: "$conversations",
                        status:"$status"
                        
                      }
                    }
                  }
                }
              ]).toArray(),
              
        
            await entries.aggregate([
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
                        _id:userId,
                        histories:{
                            $push:{
                                date:"$histories.date",
                                tittle:"$histories.tittle",
                                description:"$histories.description",
                                summary:"$histories.summary",
                                status:"$histories.status"
                            }
                        }
                    }
                }
            ]).toArray()
        ])
        
        console.log(chatdata.chatId)
        let combinedData
        
        containsnull(chatdata) || containsnull(history)?console.log(`null values in ${history} or ${chatdata}`):combinedData=[...chatdata, ...history]
        
        console.log("combineddata..... ",combinedData)
        return combinedData
    }catch(e){
        console.log('error in combining data',e)
    }
}

//funtion to merge the data  (historis) of the same _id
const mergeddata= async(data)=>{
    try{
        console.log("merged history entered...")
        const mergedData={}
    
        data.forEach((item) => {
            if(!mergedData[item._id]){
                mergedData[item._id]={
                    _id:item._id,
                    histories:[]
                }
            }
    
            mergedData[item._id].histories=[
                ...mergedData[item._id].histories,
                ...item.histories
            ]
        });
        console.log("merged data")

        return Object.values(mergedData)
    }catch(e){
        console.log("error in merging the history", e)
    }
}


//get the history entries from the database to display
router.get('/myhistory',async(req,res)=>{
    try{
        const db=await getdb()
        const entries=db.collection('history')
        const chats=db.collection('data')
        const userId=req.user.googleId

        const message="from the above conversations generate me a brief summary "
        const response =await chats.find({
            _id:userId
        }).toArray()

        //generate summaries if the summaries do not exist or is not updated to the current time 
        for (const chat of response[0].chats) {
            if(!chat.summaryTime || chat.updatedAt.getTime()>chat.summaryTime.getTime()){
                const flowisedata={
                    question:message,
                    chatId:chat.chatId
                }
                const  summaryresponse=await  sendToFLowise(flowisedata)
                console.log("summary response ", summaryresponse.text)

                const updatedsummary=await chats.updateOne(
                    {_id:userId,
                        "chats.chatId":chat.chatId
                    },
                    {$set:{"chats.$.summary":summaryresponse.text,
                        "chats.$.summaryTime":new Date()}
                    }
                )

                if (updatedsummary.modifiedCount > 0){
                    console.log("summary generated and updated ")
                    const combinedData=await combineddata(req)
                    
                    const combined_data=Array.isArray(combinedData)? combinedData: Array.from(combinedData)
                
                    const unsortmergeddata=await mergeddata(combined_data)
                    const datamerged=unsortmergeddata[0].histories.sort((a,b)=> new Date(b.date)-new Date(a.date))
                    console.log('datamerged ', datamerged)
                    res.status(200).json(datamerged)
                        
                    
                }

            }
                
            const combinedData=await combineddata(req)
            
            const combined_data=Array.isArray(combinedData)? combinedData: Array.from(combinedData)
                
            const unsortmergeddata=await mergeddata(combined_data)
            const datamerged=unsortmergeddata[0].histories.sort((a,b)=> new Date(b.date)-new Date(a.date))
            console.log('datamerged ', datamerged)
            res.status(200).json(datamerged)
                        
           

            
        }
    
        // console.log('combined data  ',combinedData)
 

    }catch(e){
        console.log(`error in getting entries : ${e}`)
    

    }
})


//router to download the entries in pdf form
router.get('/download', async(req,res)=>{
    try{
       console.log('download entered')
        const userId=req.user.googleId
        const keydates = req.query.keydate;
        if (!keydates) {
            return res.status(400).json({ error: 'No dates provided' });
        } else{
            console.log('keyydates to download',keydates)
        }

        const db = await getdb();
        const history = db.collection('history');
        const chatcollection=db.collection('data')

        if (!Array.isArray(keydates)) {
            // Handle single date
            const parsedDate = new Date(keydates);
            if (isNaN(parsedDate.getTime())) {
                try{
                    console.log('chatID to download')
                    
                    console.log('chatId2',keydates)

                    const chatdata=await chatcollection.findOne(
                    {
                        _id:userId,
                        "chats.chatId":keydates
                    })
                console.log('Found data:', chatdata);
                generatepdf([chatdata], res);
                } catch(e){
                    console.error("error in downoalding single chatId",e )
                    return res.status(400).json({ error: 'Invalid date format' });
                }
            } else{
                console.log('Searching for date:', parsedDate);
                const data = await history.findOne(
                    {
                        _id: userId,
                        "histories.date": parsedDate
                    },
                    {
                        projection: {
                            histories: { $elemMatch: { date: parsedDate }}
                        }
                    }
                );
    
                if (!data) {
                    return res.status(404).json({ error: 'No data found for the specified date' });
                }
                console.log('Found data:', data);
                generatepdf([data], res);
            }


        } else {
            // Handle multiple dates
            const results = [];
            for(const dateStr of keydates) {
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                    console.log('Searching for date:', parsedDate);
                    const data = await history.findOne(
                        {
                            _id: userId,
                            "histories.date": parsedDate
                        },
                        {
                            projection: {
                                histories: { $elemMatch: { date: parsedDate }}
                            }
                        }
                    );
                    if (data) {
                        results.push(data);
                    }
                } else{
                    try{
                        console.log('downloading data with chatid')
                        const chatdata=await chatcollection.findOne(
                        {
                            _id:userId,
                            "chats.chatId":dateStr
                        }
                    )
                    console.log('Found data:', chatdata);
                    results.push(chatdata)
                    } catch(e){
                        console.error("error in downoalding single chatId",e )
                        return res.status(400).json({ error: 'Invalid date format' });
                    }

                }
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'No data found for any of the specified dates' });
            }

            console.log('Found data for multiple dates:', results);
            // mergedData=mergehistories(results)
            generatepdf(results, res);
        }
    } catch(error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
})

//router to delete the entries
router.post('/delete',async(req,res)=>{
    try{
        const userId=req.user.googleId
        const keydates=req.body
        // console.log(req.body)
        const db=await getdb()
        const chatcollection=db.collection('data')
        const historycollection=db.collection('history')
        console.log('keydates in delete', keydates)

        keydates.forEach(async(dates)=>{
            const date=new Date(dates)
            console.log(date)
            if(!isNaN(date)){
                console.log('date to be deleted ', date)
                const deleteresult=await historycollection.updateOne(
                    {
                    _id:userId,
                    "histories.date":date,
                    "histories":{$elemMatch:{date:date}}
                    },
                    {
                        $pull:{ "histories":{date:date}}
                    }
             
                )
                console.log("delte results",deleteresult)
                if(deleteresult.modifiedCount>0){
                    console.log("deleted successfully")
                    res.status(200).json({success:true})
            }
            } else{
                  console.log('date to be deleted ', dates)
                const deleteresult=await chatcollection.updateOne(
                    {
                        _id:userId,
                        "chats.chatId":dates,
                        chats:{$elemMatch:{chatId:dates}}
                    },{
                        $pull:{
                            "chats":{chatId:dates}
                        }
                    }
                )
                if(deleteresult.modifiedCount>0){
                    console.log("deleted successfully")
                    res.status(200).json({success:true})
                }
            }
        })
        
    }catch(e){
        console.log('errror in deleting data ', e)
    }
})

//router to make entries starred
router.post('/updates',async(req,res)=>{
    try{

        const keydates=req.body.keyydate
        // keydates=keydates.
        const db=await getdb()
        const userId=req.user.googleId
        const chatscollection=db.collection('data')
        const history=db.collection('history')
        console.log("keydates", keydates)
        keydates.forEach(async(dates)=>{
            const date=new Date(dates)
            console.log("date to be updated",date)

           if (isNaN(date.getTime())){   //if  it is not a date
            console.log("it is a chatId", dates)
            const results=await chatscollection.updateOne(
                {
                    _id:userId,
                    "chats.chatId":dates,
                    "chats":{$elemMatch:{chatId:dates}}
                },
                {
                   $set:{"chats.$.status":"starred"}
               }
               )

            if (results.modifiedCount>0){
                console.log("updated data")
                res.status(200).json({success:true})
            }
           } else{
            
               const results=await history.updateOne(
                   {_id:userId,
                       "histories.date":date,
                       "histories":{$elemMatch:{date:date}}
                   },
                   {
                       $set:{"histories.$.status":"starred"}
                   }
               )
   
               if (results.modifiedCount>0){
                   console.log("updated data")
                   res.status(200).json({success:true})
               }
   
               } 
       })
            
             


    }catch(e){
        console.log('error in updating',e)
    }
})

//EVENTS
router.get('/events',async(req,res)=>{
    res.render('events.ejs')
})

//getevents from the database
router.get('/allevents',async(req,res)=>{
    try{
        const db=await getdb()
        const eventscollection=await db.collection('events')
        const userId=req.user.googleId
        const events=await eventscollection.findOne({
            _id:userId,
        })
        // console.log("events", events)
        res.status(200).json(events)
    }catch(e){
        console.error(`failed to get the events from the database ${e}`)
    }
})
//function to sendmail
async function sendmail(to,subject,body){
    try{

        const transporter=nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            auth:{
                user:"spencernyaenya@gmail.com",
                pass:"jiml nuuw vmui glda"
            }
        }
        )
    
        const aboutmail={
            from:'"afya24-7" <spencernyaenya@gmail.com>',
            subject:subject || 'Health update',
            text:body,
            to:to
        }
        const infomail= await transporter.sendMail(aboutmail)
        console.log(infomail)
        return(infomail)
    }catch(e){
        console.error('error in sending email...',e)
    }
}

//function to set an event uncomplete

async function uncompletevent() {
    try{
        const db=await getdb()
        const eventcollection=db.collection('events')
        const userId=req.user.googleId
        const date=new Date().toISOString()
        console.log('date today..',date)

        const uncompleted=await eventcollection.updateOne(
            {
                _id:userId,
                "events.datedue":{$lt:date},
                "events.status":"upcoming",
                 events:{$elemMatch:{
                    datedue:{$lt:date},
                    status:'upcoming'
                }}

            },
            {
                $set:{

                    "events.$.status":'uncompleted'

                }
            }
        )
        console.log('uncompleted...',uncompleted)

        if(uncompleted.modifiedCount>0){
            console.log('set uncomplete successfully', uncompleted)
        } else{
            console.log("setting uncomplete failed!!")
        }

    }catch(e){
        console.error('unable to set event uncomplete...',e)
    }
    
}

//function for sending notification
async function sendnotification(){
    try{
        console.log('cron entered successfully...')
        const db=await getdb()
        const eventcollection=db.collection('events')
        const date =new Date()
        const userId=req.user.googleId
        console.log(date)

        const datatosend= await eventcollection.findOne({
            _id:userId
            // "events.datedue":"2025-02-14T00:00:00.000Z"},
        },
            {
                projection:{
                    events:{
                        $elemMatch:{
                            datedue: date,
                            status:"upcoming"
                        }
                    }
                }
        })
        console.log("result from db ",datatosend)
        // console.log("results3....",datatosend.events)
        if (datatosend){
            const results=datatosend.events
            console.log("results....",results)
            console.log("results2....",results[0].summary)
            
            const to="nyaenyaspencer21@gmail.com"
            const subject=results[0].summary 
            const instruction=` You are an intelligent reminder assistant who writes emails given a text .
                                given : text =${results[0].description}  generate  a brief  email body, to inform about the text:${results.description} 
                                include greetings , and always be polite
                                always start with Dear sir, and finish with thank you, do not add anything or be verbous `
        
            const bodyinfo=await querymodel(instruction)
            console.log('body information ...',bodyinfo)
        
            const body=bodyinfo
    
        
            const sentemail=await sendmail(to,subject,body)
            if(sentemail.messageId){
                console.log(sentemail)
                console.log("email sent")
                res.status(200).json(sentemail)
            }
        }
    }catch(e){
        console.error('error in sending notification ',e)
    }
    


}
//sending notification for an event 
try{
    cron.schedule(' 0 7 * * *',async()=>{
        try{
            await uncompletevent()
            await sendnotification()

        }catch(e){
            console.log('error in cron...',e)
        }
    }
)
} catch(e){
    console.error('error in notification or updating uncomplete events...',e)
    
    
}

// manageevents....this is where are either set completed, cancelled or deleted/activated
router.post('/manageevent',async(req,res)=>{
    try{

        const db=await getdb()
        const eventcollection=db.collection('events')
        const userId=req.user.googleId
        const {description,date,task}=req.body
        console.log('descriptions..',description  )
        // const dates=new Date(date)
        // !isNaN(datestr.getTime())?console.log('date entered is true date',datestr):console.error('dates entered not a real date')
        console.log('date completed...',date)
        if(task=='complete'){
            console.log('completed task entered...')
            const completeresults=await eventcollection.updateOne(
                {
                    _id:userId,
                    'events.datedue':date,
                    'events.description':description,
                     "events":{$elemMatch:{description:description,datedue:date}}
                },
                {
                    $set:{
                        'events.$.status':'completed'
                    }
                }

            )
            console.log('completeresult...',completeresults)
            if(completeresults.modifiedCount>0){
                res.status(200).json(completeresults)
            } else{
                console.error('error in marking the status complete')
            }
            
        } else if(task=='cancel'){
            console.log('cancelled task entered...')
            const cancelledresults=await eventcollection.updateOne(
                {
                    _id:userId,
                    'events.datedue':date,
                    "events":{$elemMatch:{description:description,datedue:date}}                    
                },
                {
                    $set:{
                        'events.$.status':'cancelled'
                    }
    
                }

            )
            if(cancelledresults.modifiedCount>0){
                console.log('event cancelled successfully')
                res.status(200).json(cancelledresults)
            } else{
                console.error('error in cancelling an event')
            }
             
        } else if(task=='delete'){
            console.log('deleting event entered...')
            const deletedresults=await eventcollection.updateOne(
                {
                    _id:userId,
                    'events.datedue':date,
                    'events.description':description,
                    "events":{$elemMatch:{description:description,datedue:date}}
                },
                {
                    $pull:{'events':{datedue:date}}
    
                }

            )
            if(deletedresults.modifiedCount>0){
                res.status(200).json(deletedresults)
            } else{
                console.error('error in deleting an event')
            }
            

        } else{
            console.log('activating event ....')
            const activateresults=await eventcollection.updateOne(
                {
                    _id:userId,
                    'events.datedue':date,
                    "events.description":description,
                    "events":{$elemMatch:{description:description,datedue:date}}
                },{
                    $set:{
                        'events.$.status':'upcoming'
                    }
                    
                }

            )
            console.log('activated event...',activateresults)
            if(activateresults.modifiedCount>0){
                res.status(200).json(activateresults)
            } else{
                console.error('error in marking the status upcoming')
            }

        }

    } catch(e){
        console.error('error managing an event',e)
        
    }
})




//get the reminder from flowise
router.post('/greminder',async(req,res)=>{
    try{
        const reminder=req.body.rem
        const date=new Date()
        console.log('instructions', reminder)
        const instruction = `
        You are an intelligent reminder assistant. Your task is to categorize reminders correctly and generate structured JSON responses    
        Given the following details:
        - Current Date: ${date}
        - Reminder: ${reminder}
        
        Generate a structured reminder in the following JSON format, selecting the most appropriate type and description:
                    {
                        type:either personal / appointment
                        description:brief  description about a 1 or 2 sentences about ${reminder}
                        summary:brief summary like 'appointment with Dr.David/... or morning run on the hill'
                        datedue:the date when the event is to be accomplished ,
                        dateset:the current Date ,
                        status:"upcoming"  
                    }
        
    
        Guidelines:
        - Ensure 'summary' is meaningful and limited to 5 words.
        - Format all dates to match the format : 2025-03-15T00:00:00.000Z.
        - Respond strictly with the JSON object, without any additional text/ character.
        
        if no ${reminder} respond only with no reminder..`;

    

        const stringfiedresponse=await querymodel(instruction)
        console.log("stringifiedresponse ...", stringfiedresponse)
        let response
        // if (typeof stringfiedresponse==='string'){
        //    response=JSON.parse(stringfiedresponse)
        // } else{
        //     response=stringfiedresponse
        // }

        response= typeof stringfiedresponse =='string'? JSON.parse(stringfiedresponse):stringfiedresponse
        console.log('response...',response)
        modifresponse=[response]
        console.log(`modifedresponse ${modifresponse}`)
        const finalres=Object.values(modifresponse[0])
        console.log('finalres ...', finalres)
        Array.isArray(modifresponse)?console.log(finalres.type):console.log('not array')
        res.status(200).json(modifresponse)                 

    } catch(e){
        console.error(`error in getting reminder ${e}`)
    }

})

router.post('/storeevent', async(req,res)=>{
    try{

        console.log('store event entered')
        const db=await getdb()
        const eventcollection=await db.collection('events')
        const {reminder}= req.body
        const userId=req.user.googleId
        console.log('reminder',reminder)

        const objectId=await eventcollection.findOne({
            _id:userId
        })

        if (!objectId){
            await eventcollection.insertOne({_id:userId})
        }

        const events={
            type:reminder.type,
            description:reminder.description,
            summary:reminder.summary,
            datedue:reminder.datedue,
            dateset:reminder.dateset,
            status:"upcoming"   
        }

        if (containsnull(events)){
            console.log(`null value in ${events}`)
        }else{
            const response=await eventcollection.updateOne(
                {
                    _id: userId
                },
                {
                    $push:{
                        events:events
                    }
        
                }
            ) 
          
            
            response.modifiedCount>0?res.status(200).json(response):console.log('no event stored ')
        }
       
    }catch(e){
        console.error('error in storing event',e)
    }    

})





module.exports = router
