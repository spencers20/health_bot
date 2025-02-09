const express=require('express')
const PDFDocument = require('pdfkit')
const {savesession,getcollection,initializecollection ,resetactiveChatIds, getdb}= require('./config/database')
const app=express()
const session = require("express-session");
const passport = require("passport");
require('dotenv').config()
const google=require('./routes/google') //calling the google. route
require('./config/passport')
const user=require('./routes/user')
const path=require('path')
const cron=require('node-cron')
const fs =  require('fs');
const { get } = require('http');
const { CommandStartedEvent } = require('mongodb');
const Groq=require('groq-sdk')


// const collection=require('./database')
// const collection=savesession.collection

// getting views 
app.set('views','./views')
app.set('view_engine','ejs')

//serve static files
app.use(express.static(path.join(__dirname,'public')))


// Set up session management and passport globally
app.use(session({ 
    secret: process.env.SECRET_KEY, 
    resave: false, 
    saveUninitialized: true,
    cookie: {secure :process.env.NODE_ENV === 'production'}
 }));
app.use(passport.initialize());
app.use(passport.session());

// getting the routes 
app.use('/google',google)
app.use('/user',user)

app.use(express.json())

// Reseting activeChatIds Every day in the midnight

try{
    console.log('cron started...')
    cron.schedule('0 0 * * *', resetactiveChatIds)
   
   
} catch(e){
    console.error(`error in cron : ${e}`)
}

app.get('/',(req , res)=>{
    console.log('entered')
    res.render('trial.ejs')
})
// app.get('/symptomchecker',(req , res)=>{
//     console.log('entered')
//     res.render('symptom.ejs') <%=user.name%> 
    
// })


app.get('/tips',async(req , res)=>{
    try{
        // console.log('tips url entered...')
        const db=await getdb()
        const tipscollection=db.collection('tips')
        const tipsindb= await tipscollection.find().toArray()
        // console.log(tipsindb)

        res.status(200).json(tipsindb)
 
    }catch(e){
        console.error(`error in getting tips from db : ${e}`)
    }

    
})

app.get('/events',async(req,res)=>{
    try{
        const db=await getdb()
        const eventscollection=await db.collection('events')
        const events=await eventscollection.findOne({
            _id:"100984849132378172203",
        })
        // console.log("events", events)
        res.status(200).json(events)
    }catch(e){
        console.error(`failed to get the events from the database ${e}`)
    }
})

async function getsummary(instruction){
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

//get the reminder from flowise
app.post('/greminder',async(req,res)=>{
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
          "reminder": {
            "type": "{either 'appointment' or 'personal'}",
            "description": "{geneerate a brief but complete description of the ${reminder}}",
            "summary": "{concise summary of max 5 words e.g 'appointment with dr.jacob' depending on the ${reminder}}",
            "datedue": "{same format as  e.g "2025-02-14T00:00:00.000Z"}",
            "dateset": "{same format as e.g "2025-02-14T00:00:00.000Z"}",
            
          }
        }
        
        Guidelines:
        - Ensure 'summary' is meaningful and limited to 5 words.
        - Format all dates to match ${date}.
        - Respond strictly with the JSON object, without any additional text.
        
        if no ${reminder} respond only with no reminder..`;

    

        const stringfiedresponse=await getsummary(instruction)
        console.log("response ...", stringfiedresponse)
        let response
        // if (typeof stringfiedresponse==='string'){
        //    response=JSON.parse(stringfiedresponse)
        // } else{
        //     response=stringfiedresponse
        // }

        response= typeof stringfiedresponse =='string'? JSON.parse(stringfiedresponse):stringfiedresponse
        modifresponse=[response]
        console.log(`modifedresponse ${modifresponse}`)
        const finalres=Object.values(modifresponse[0])
        console.log('finalres ...', finalres)
        Array.isArray(modifresponse)?console.log(finalres.type):console.log('not array')
        res.status(200).json(finalres)                 

    } catch(e){
        console.error(`error in getting reminder ${e}`)
    }



})

app.post('/storeevent', async(req,res)=>{
    try{

        console.log('store event entered')
        const db=await getdb()
        const eventcollection=await db.collection('events')
        const {reminder}= req.body
        console.log('reminder',reminder)
        const response=await eventcollection.updateOne(
            {
                _id: "100984849132378172203"
            },
            {
                $push:{
                    events:{
                        type:reminder.type,
                        description:reminder.description,
                        summary:reminder.summary,
                        datedue:reminder.datedue,
                        dateset:reminder.dateset,
                        status:"upcoming"   
    
                    }
                }
    
            }
        ) 
      
        
        response.acknowledged?res.status(200).json(response):console.log('no event stored ')
       
    }catch(e){
        console.error('error in storing event')
    }    

})
//delete data 


app.get('/get/:id',
    async(req , res)=>{
        try{
            const collection= await getcollection()
            const userId=req.params.id

            const result =await collection.find({userId:userId}).toArray()
            console.log(result)

            res.status(200).json(result)
           

        }catch(e){
            console.log({error1:`${e}`})
            res.json( {error1:`${e}`})
        }
    }
)


app.post('/ask',
    async(req , res)=>{
    try{
        console.log('asked...')
        const {message}=req.body

        const data={
            question : message,
            
        }
        
        const response = await fetch(
            "http://20.4.189.12:3000/api/v1/prediction/45f5a627-3b9d-4f90-a7df-597c1729b0f1",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        // console.log()
        // savesession(response)
        const result = await response.json();
        // console.log( `response: ${result.text}`)
        // const saved = await savesession(result)
        // console.log(saved)
        console.log(result)
    
        res.status(200).json(result)
        return result
    
    }catch(e){
        res.json({error:`${e}`})
    }
    
    })

// (async ()=>{
//     await initializecollection()
// })

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','index.ejs'))
})

initializecollection().then(()=>{
app.listen(3000 ,()=>{
  
    console.log("listening at :http://localhost:3000")
})
})
