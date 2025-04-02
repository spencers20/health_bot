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
const doctors=require('./routes/doctors')
const admin=require('./routes/admin')

const path=require('path')
const cron=require('node-cron')
const fs =  require('fs');
const { get } = require('http');
const { CommandStartedEvent } = require('mongodb');
const Groq=require('groq-sdk')
const nodemailer=require('nodemailer')
const bcrypt=require('bcrypt');
const { composer } = require('googleapis/build/src/apis/composer');
const {format}=require('date-fns');
const { start } = require('repl');
const puppeteer=require('puppeteer');
const { report } = require('process');
const {generatemyid,querymodel}=require('./config/reuse')

// const collection=require('./database')
// const collection=savesession.collection

// <%=user.name.split(" ")[1]? user.name.split(" ")[1]:user.name%> 
// getting views 
app.set('views','./views')
app.set('view_engine','ejs')

//serve static files
app.use(express.static(path.join(__dirname,'public')))

app.use('/images',express.static('images'))


// Set up session management and passport globally
app.use(session({ 
    secret: process.env.SECRET_KEY, 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        secure :process.env.NODE_ENV === 'production',
        httpOnly:true,
        maxAge:1000*60*30
              
    }
 }));
app.use(passport.initialize());
app.use(passport.session());

// getting the routes 
app.use('/google',google)
app.use('/user',user) 
app.use('/doctors',doctors)
app.use('/admin',admin)

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
    res.render('index.ejs')
})

app.get('/logins',(req , res)=>{
    console.log('entered')
    res.render('login.ejs') 
})

app.get('/header',(req,res)=>{
    console.log('headers')
    res.render('header.ejs')
})

app.get('/getdes',async(req,res)=>{
    console.log('entereed...')
    const speciality='Orthopedist,GP'
    const instruction=`given the following speciality of a doctor ${speciality} generate a brief description about speciality example for Neurosurgeon , "Perfoms brain and spinal surgeries ." if 2 specialities like(Neurosurgeon,GP) briefly return each with conjuction and ;your response should   return only the brief description nothing more and should generally have a maximum of 8 words only`
    const description=await querymodel(instruction)
    console.log(description)
    res.status(200).json(description)
})
app.get('/allparticipants',async(req,res)=>{
    try{
        const db=await getdb()
        const alldocs=await db.collection('doctors').find().toArray()
        const allnurses=await db.collection('nurses').find().toArray()
        const allusers=await db.collection('users').find().toArray()
        const alladmins=await db.collection('administrator').find().toArray()
       

        res.status(200).json({alldocs,allnurses,allusers,alladmins})
        

        
    }catch(e){
        console.error('error in getting all doctors..',e)
        res.json({errror:`error in getting all doctors..${e}`})
    }
})

app.post('/remove',async(req,res)=>{
    try{
        const partyId=req.body.partyId
        const db=await getdb()
        const nurseordoc=await db.collection('nurses').findOne({_id:partyId}) ||await db.collection('doctors').findOne({_id:partyId}) 
       if(!nurseordoc){
        res.json({message:`${partyId} does not exist in the system`})
        return
       }
       console.log('deleting ...')
       console.log('doctor to be deleted..',typeof partyId)
       console.log(nurseordoc)
       if(nurseordoc.role=='Doctor'){
        const deletingdoc = await db.collection('doctors').deleteOne({ _id: partyId }); // If _id is a string
        console.log('deletingdoc....',deletingdoc)
        deletingdoc.deletedCount>0?res.status(200).json({message:'Doctor removed from system successfully'}):res.json({message:'Error removing doc from system'})
       }else{
        const deletingnurse=await db.collection('nurses').deleteOne({_id:partyId})
        console.log('deletingdoc....',deletingnurse)
        deletingnurse.deletedCount>0?res.status(200).json({message:'Nurse removed from system successfully'}):res.json({message:'Error removing nurse from system'})
       }
        
    }catch(e){
        console.error('error in getting all users..',e)
        res.json({errror:`error in getting all users..${e}`})
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

app.get('/docs', async(req, res)=>{  //****for doctor
    try{
        const db=await getdb()
        const docscollection=await db.collection('doctors')
        const docs= await docscollection.find().toArray()
      
        res.status(200).json(docs)
    }catch(e){
        console.error('not getting the doctors')
    }


})



// app.get('/getmypatients',async(req,res)=>{
//     try{
//         console.log('getting my patients')
//         const db=await getdb()
//         const docappcollection=await db.collection('docappointments')
//         const docId='D123478JO'
   
//         const mypatients= await docappcollection.findOne(
//             {
//                 _id:docId
//             }
//         )

//         console.log(mypatients)
//         if(mypatients){
//             res.status(200).json(mypatients)
//         }else{
//             res.json({error:'can not get my patients'})
//         }

//     }catch(e){
//         console.log("error in getting appointment requests...",e)
//     }
// })

app.post('/askgroq',async(req,res)=>{
    console.log('asking groq.....')
    const {message}=req.body
    console.log('question asked...',message)
    const instruction=` you are a health assistant who answers health related questions,given the following ${message} , give me related insights and answer the question correctly and alwas finish by asking the user to alwas visit the doctor`
    const results=await  getsummary(instruction)
    console.log('results from groq...',results)
    res.status(200).json(results)
})

// app.post('/ask')

app.post('/acceptcancel',async(req,res)=>{
    try{ 
        // let savebooking
        console.log("saving bookng....")
        const db=await getdb()
        const docappcollection=await db.collection('docappointments')
        const userevents=await db.collection('events')
        const {reqdecision,patient,date}=req.body
        const pid="100984849132378172203"
       
        const docId="D123478JO"

        if(reqdecision=='accepted'){
            const accepted=await docappcollection.updateOne(
                { 
                    _id: docId, 
                    "appointmentdates.date": reqdecision.date, 
                    "appointmentdates.patients.name": patient.name 
                },
                { 
                    $set: { "appointmentdates.$[].patients.$[patient].status": reqdecision.status } 
                },
                { 
                    arrayFilters: [{ "patient.name": patient.name }]
                }
           )
           if(accepted.modifiedCount>0){
            res.status(200).json({success:true,message:'appointment accepted successfully'})
          
           }else{
            console.log('error in accepting request')
           }


        }
     
        const [savebooking, mydocappointment]=await Promise.all([
                 docappcollection.updateOne(
                    { 
                        _id: docId, 
                        "appointmentdates.date": reqdecision.date, 
                        "appointmentdates.patients.name": patient.name 
                    },
                    { 
                        $set: { "appointmentdates.$[].patients.$[patient].status": reqdecision.status } 
                    },
                    { 
                        arrayFilters: [{ "patient.name": patient.name }]
                    }
               ),
               userevents.updateOne({
                // _id:patient.id
                _id:pid,
                "events.datedue":reqdecision.date,
                "events.type":"appointment"

               },
               {
                $set:{"events.$.status":reqdecision.status}
               }
            )

            ])

          
        
        console.log("savebooking...",savebooking)
        console.log("mydocappointment..",mydocappointment)
        if(savebooking.modifiedCount>0 && mydocappointment>0 ){
            console.log('worked')
            res.status(200).json({success:true,message:'appointment cancelled successfully'})
        }else{
            res.json({error:"Request not sent , please book again"})
        }
    }catch(e){
        console.log('errror in adding to db..',e)
    }


    
})

// app.post('/savetodoc',async(req,res)=>{  
//     try{ 
//         // let savebooking
//         console.log("saving bookng....")
//         const db=await getdb()
//         const docappcollection=await db.collection('docappointments')
//         const {seldoctor,patient}=req.body
//         const userId="100984849132378172203"
//         const settime=patient.session
//         patientbook={
//             // name:user.name,
//             id:userId,
//             session:settime,
//             type:patient.type,
//             status:"pending"

//         }
//         const userevents=await db.collection('events')
//         const appointevent={
//             type:"appointment",
//             description:`a ${patient.type} appointment with ${seldoctor.name} on ${seldoctor.date} at ${settime} `,
//             summary:`a ${patient.type} with ${seldoctor.name} `,
//             datedue:new Date(seldoctor.date),
//             dateset:new Date(),
//             status:"upcoming"
//         }
//         console.log('doc details',seldoctor)
//         console.log(new Date(seldoctor.date))
//         let acceptedpatient
//         !Array.isArray(patient)? acceptedpatient=[patient]:acceptedpatient=patient
        
//             console.log('patient does  exist ')
//         const [savebooking, mydocappointment]=await Promise.all([
//                  docappcollection.updateOne(
//                    {_id:seldoctor.doctor,
//                    "appointmentdates.date":seldoctor.date
//                    },
//                    {
//                        $push:{
//                        "appointmentdates.$.patients": patientbook
//                       }, 
//                       $pull:{
//                        "appointmentdates.$.appointmenttime": settime
//                       },
//                       $addToSet:{"appointmentdates.$.bookedtime":settime}
   
//                }
//                ),
//                userevents.updateOne({
//                 _id:userId
//                },
//                {
//                 $push:{events:appointevent}
//                }
//             )

//             ])

          
        
//         console.log("savebooking...",savebooking)
//         console.log("mydocappointment..",mydocappointment)
//         if(savebooking.modifiedCount>0 && mydocappointment>0 ){
//             console.log('worked')
//             res.status(200).json({success:true})
//         }else{
//             res.json({error:"Request not sent , please book again"})
//         }
//     }catch(e){
//         console.log('errror in adding to db..',e)
//     }
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


// app.get('/allevents',async(req,res)=>{
//     try{
//         const db=await getdb()
//         const eventscollection=await db.collection('events')
//         const userId="100984849132378172203"
//         const events=await eventscollection.findOne({
//             _id:userId,
//         })
//         // console.log("events", events)
//         res.status(200).json(events)
//     }catch(e){
//         console.error(`failed to get the events from the database ${e}`)
//     }
// })



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
        // console.log('asked...')
        // const {message}=req.body

        // const data={
        //     question : message,
            
        // }
        
        // const response = await fetch(
        //     "http://20.4.189.12:3000/api/v1/prediction/45f5a627-3b9d-4f90-a7df-597c1729b0f1",
        //     {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify(data)
        //     }
        // );

        // // console.log()
        // // savesession(response)
        // const result = await response.json();
        // // console.log( `response: ${result.text}`)
        // // const saved = await savesession(result)
        // // console.log(saved)
        console.log('asking groq.....')
        const {message}=req.body
        console.log('question asked...',message)
        const instruction=` you are a health assistant who answers health related questions,given the following ${message} , give me related insights and answer the question correctly and alwas finish by asking the user to alwas visit the doctor`
        const results=await  getsummary(instruction)
        console.log('results from groq...',results)
        res.status(200).json(results)
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
