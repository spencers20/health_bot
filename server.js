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
    res.render('admin.ejs')
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
       

        res.status(200).json({alldocs,allnurses,allusers})
        

        
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

// app.get('/allnurses',async(req,res)=>{
//     try{
//         const db=await getdb()
//         const allnurses=db.collection('nurses').find().toArray()
//         if(allnurses>0){
//             res.status(200).json(allnurses)
//         }else{
//             res.json({message:'no docs around'})
//         }

        
//     }catch(e){
//         console.error('error in getting all nurses..',e)
//         res.json({errror:`error in getting all nurses..${e}`})
//     }
// })

// app.get('/allusers',async(req,res)=>{
//     try{
//         const db=await getdb()
//         const allusers=db.collection('users').find().toArray()
//         if(allusers>0){
//             res.status(200).json(allusers)
//         }else{
//             res.json({message:'no users around'})
//         }

        
//     }catch(e){
//         console.error('error in getting all users..',e)
//         res.json({errror:`error in getting all users..${e}`})
//     }
// })



// app.get('/reportnow', async(req,res)=>{
//     try{
//         // const{reportId}=req.body
//         const db=await getdb()
//         const repocollection=await db.collection('reports')
//         const userId="BM382487"
//         // const reportId="2025-03-15T16:12:38.193Z"
//         // const myreport=await repocollection.find(
//         //     {
//         //        _id:userId
//         //     }
            
//         // ).toArray()

//         const myreport=await repocollection.aggregate([
//             {$match:{_id:userId}},
//             {$unwind:"$reports"},
//             {$sort:{"reports.reportId":-1}},
//             {$group:{
//                 _id:"$_id",
//                 name:{$first:"$name"},
//                 birthdate:{$first:"$birthdate"},
//                 gender:{$first:"$gender"},
//                 reports:{$push:"$reports"}
//             }}

//         ]).toArray()
//         if(myreport || myreport.lenght>0){
//             console.log('reportfound',myreport)
//             res.status(200).json(myreport)
//         } else{
//             console.log('report not found')
//             res.status(400).json({message:"report not found"})
//         }
        

//     }catch(e){
//         console.error('not getting the current report',e)
//     }
// })

// app.post('/finishreport',async(req,res)=>{   //****for doctor
//     try{
//         const {reportId,docrecommendation,docassessment,patientId,sentdate}=req.body
//         const db=await getdb()
//         const docId="D123478JO"
//         const repodate=new Date(sentdate).toISOString().split('T')[0]
//         const [finishrepo,finishdoc]=await Promise.all([
//             db.collection('docreports').updateOne(
//                 {    _id: docId,
//                     "reports.date": repodate, 
//                    "reports.patients.id": patientId
//                 },
//                 { $set: { "reports.$[report].patients.$[patient].status": "complete" } },
//                 {
//                   arrayFilters: [
//                     { "report.date": repodate },
//                     { "patient.id": patientId }
//                   ]
//                 }
//               )
//             ,
//             await db.collection('reports').updateOne(
//                 {
//                     _id:patientId,
//                     "reports.reportId":new Date(reportId)
//                 },
//                 {   
//                     $set:{
//                        "reports.$.status":'complete',
//                        "reports.$.doctor.assessment":docassessment,
//                        "reports.$.doctor.recommendation":docrecommendation
//                     }
//                 } && finishdoc.modifiedCount>0
//             )

            
//         ])
//          console.log(finishrepo)
//         if(finishrepo.modifiedCount>0){
//             console.log(`in doc details ${finishrepo} and in reports `)
//             res.status(200).json({success:true ,message:"report finished success"})
//         }else{
//             res.json({success:false, error:"report not finished"})
//         }
//     }catch(e){
//           console.log('error in finishing report....',e)
//           res.json({error:"error in finishing report",e })
//     }

// })

// app.post('/setavailability',async(req,res)=>{ //****for doctor
//     try{
//         const {status}=req.body
//         console.log('status...',status)
//         const db=await getdb()
//         const docscollection=await db.collection('doctors')
//         const docrepos=await db.collection('docreports')
//         const docId='D123478JO'

        

//         await docscollection.updateOne(
//             { _id: docId },
//             { $unset: { status: "" } } // Removes the field
//         );

//         const statusresults=await docscollection.updateOne(
//             {
//                 _id:docId
//             },
//             {
//                 $set:{
//                     "status":status
//                 }
//             }
//         )

//         if(statusresults.modifiedCount>0){
//             const doc=await docscollection.findOne(
//                 {
//                     _id:docId
//                 }
//             )
//             // console
//             if(doc.status=='active'){
//                 const docfound = await docrepos.findOne(
//                     {
//                         _id: docId,
//                         "reports.date": new Date().toISOString().split('T')[0] // Correct way to filter
//                     },
//                     {
//                         "reports.$": 1 // Only return the matched report
//                     }
//                 );

//                 let newdate
//                 if(!docfound){
//                     console.log('doc not found')
//                     newdate=await docrepos.updateOne(
//                         {
//                             _id:docId,
                            
//                         },
//                         {
//                             $push:{
//                                 "reports":{
//                                     "date": new Date().toISOString().split('T')[0],
//                                     "patients":[]
//                                 } 
//                             }
//                         }
//                     )

//                     console.log(newdate)
//                 }
//                 if(docfound || newdate.modifiedCount>0){
//                     res.status(200).json({message:'status set to active '})
//                 }else{
//                     res.json({message:"error in setting active"})
//                 }

//             }else{
//                 res.status(200).json({message:'You have successfully closed your session'})
//             }
//         }else{
//             res.json({error:'error in updating doctors status'})
//         }


//     }catch(e){
//         console.error('error in updating status',e)
//         res.json({error:'error in updating status'})
//     }
// })

// app.get('/reportpatients', async(req,res)=>{  //****for doctor
//     try{
//         const db=await getdb()
//         const docrepos=await db.collection('docreports')
//         docId='D123478JO'
//         const reports=await docrepos.findOne({
//             _id:docId
//         })

//         if(!reports){
//                 await docrepos.insertOne(
//                     {
//                         _id:docId,
//                         reports:[]
//                     }
//                 )

//                 res.status(200).json({message:"No reports"})
            
//         }

//         res.status(200).json(reports)


//     }catch(e){
//         console.log('error in getting the patients with reports' )
//     }
// })


// app.post('/getreport',async(req,res)=>{   //****for doctor
//     try{
//         const db=await getdb()
//         const repocollection=await db.collection('reports')
//         const historycollection=await db.collection('history')
//         const {repoId,userId}=req.body

//        const [thereport,histories]=await Promise.all([
//            repocollection.findOne(
//                { _id: userId },
//                {
//                    _id: 1, // Include the patient ID
//                    name: 1, // Include the patient's name
//                    birthdate: 1, // Include birthdate
//                    gender: 1, // Include gender
//                    reports: { $elemMatch: { reportId: repoId } } // Match the specific report
//                }
//             ),
//            historycollection.aggregate([
//                 {
//                     $match:{_id:"100984849132378172203"}
//                 },
//                 {
//                      $unwind:"$histories"
//                 },
//                 {
//                     $sort:{"histories.date":-1}
//                 },
//                 {
//                  $group:{
//                     _id:"$_id",
//                     histories:{$push:"$histories"}
//                  }
//                 }
//             ]).toArray()
           
//         ])
//         if (!thereport || histories.length==0){
//             res.status(200).json({message:'no reeport available'})
//             return
//         } 
//         console.log(`report of ${userId} found`)
//         console.log(histories)
//         res.status(200).json({thereport,histories})



//     }catch(e){
//         console.error('error in getting single user reports...',e)
//     }
// })

// app.post('/generaterepo',async(req,res)=>{
//     try{
//         // const {reportId,userId}=req.body
//         const userId='BM382487'
//         const reportId='2025-03-16T11:12:45.735Z'
//         const db=await getdb()
//         const  myreport=await db.collection('reports').findOne(
//             {
//                 _id:userId
//             },{
//                 _id:1,
//                 name:1,
//                 birthdate:1,
//                 gender:1,
//                 reports:{$elemMatch:{reportId:reportId}}
//             }
//         )
//         console.log('my report for download..',myreport)
//         const date=new Date(reportId).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'})
//         const today=new Date().getTime()
//         const dob=new Date(myreport.birthdate).getTime()
//         const age=new Date(today-dob).getUTCFullYear()-1970
//         console.log(`${age}....${date}`)

//         const htmlContent = `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Patient Report</title>
//             <style>
//                 /* Reset styles */
//                 * {
//                     margin: 0;
//                     padding: 0;
//                     box-sizing: border-box;
//                 }
    
//                 /* Body and modal styling */
//                 body {
//                     font-family: Arial, sans-serif;
//                     padding: 0 20px;
//                     position: relative;
//                 }
    
//                 .modal-content {
//                     background: #fff;
//                     width: 60%;
//                     max-height: 93%;
//                     border-radius: 10px;
//                     display: flex;
//                     margin: 5px;
//                     padding: 5px;
//                     flex-direction: column;
//                     box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
//                     overflow: hidden;
//                 }
    
//                 .modal-header {
//                     padding: 15px 20px;
//                     border-bottom: 2px solid #ddd;
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     font-weight: bold;
//                     background: white;
//                 }
    
//                 .modal-body {
//                     overflow-y: auto;
//                     overflow-x: hidden;
//                     flex-grow: 1;
//                     padding: 20px;
//                     max-height: 80vh;
//                 }
    
//                 .section {
//                     margin-top: 15px;
//                     display: flex;
//                     flex-direction: column;
//                 }
    
//                 .modal-footer {
//                     padding: 10px;
//                     background: white;
//                     border-top: 1px solid #ddd;
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     font-size: 12px;
//                     position: fixed;
//                     bottom: 0;
//                     left: 0;
//                     width: 100%;
//                     border-top: 1px solid #ddd;
//                 }
    
//                 /* Footer with page number styling */
//                 .footer {
//                     text-align: center;
//                     font-size: 12px;
//                     padding: 10px;
//                     border-top: 1px solid #ddd;
//                 }
    
//                 /* Page number styling */
//                 .page-number {
//                     content: counter(page);
//                 }
    
//                 /* Ensure footer doesn't overlap content */
//                 body {
//                     padding-bottom: 60px;
//                 }
//             </style>
//         </head>
//         <body>
//             <div class="modal-content">
//                 <!-- Modal Header -->
//                 <div class="modal-header">
//                     <h2>Afyasphere</h2>
//                     <p><strong>Date:</strong> <span id="reportDate">${date}</span></p>
//                 </div>
                
//                 <!-- Modal Body -->
//                 <div class="modal-body">
//                     <!-- Patient Info -->
//                     <div class="section">
//                         <h3>Patient Report</h3>
//                         <p><strong>Name:</strong> ${myreport.name}</p>
//                         <p><strong>Age:</strong> ${age}</p>
//                         <p><strong>Gender:</strong> ${myreport.gender}</p>
//                     </div>
                    
//                     <!-- Metrics -->
//                     <div class="section">
//                         <h3>Most Recent Metrics</h3>
//                         <ul>
//                             <li><strong>Temperature:</strong> ${myreport.reports.metrics.temperature}&deg;C</li>
//                             <li><strong>Blood Pressure:</strong> ${myreport.reports.metrics.bloodPressure.systolic}/${myreport.reports.metrics.bloodPressure.diastolic} mmHg</li>
//                             <li><strong>Respiratory Rate:</strong> ${myreport.reports.metrics.respiratoryRate} breaths/min</li>
//                             <li><strong>Pulse Rate:</strong> ${myreport.reports.metrics.pulseRate} bpm</li>
//                         </ul>
//                     </div>
    
//                     <!-- Diagnosis -->
//                     <div class="section">
//                         <h3>Symptoms Diagnosis</h3>
//                         <p><strong>Symptoms:</strong> ${myreport.reports.Diagnosis[0].symptoms}</p>
//                         <p><strong>Possible Condition:</strong> ${myreport.reports.Diagnosis[0].summary}</p>
//                         <p><strong>Possible Condition:</strong> ${myreport.reports.Diagnosis[0].result}</p>
//                     </div>
                    
//                     <!-- Nurse's Assessment -->
//                     <div class="section">
//                         <h3>Nurse's Assessment</h3>
//                         <p>${myreport.reports.nurse.assessment}</p>
//                     </div>
    
//                     <!-- Doctor's Assessment -->
//                     <div class="section">
//                         <h3>Doctor's Assessment</h3>
//                         <p>${myreport.reports.doctor.assessment}</p>
//                     </div>
    
//                     <!-- Recommendations -->
//                     <div class="section">
//                         <h3>Recommendations</h3>
//                         <p>${myreport.reports.doctor.recommendation}</p>
//                     </div>
//                 </div>
    
//                 <!-- Modal Footer (No page number here) -->
//                 <div class="modal-footer">
//                     <p><strong>Report Sent By:</strong> ${myreport.reports.nurse.name}</p>
//                     <p><strong>Report Assessed By:</strong> Dr. ${myreport.reports.doctors.name}</p>
//                     <p>Generated by Afyasphere - confidential</p>
//                 </div>
//             </div>
    
//             <!-- Footer with page number -->
//             <div class="footer">
//                 Page <span class="page-number"></span>
//             </div>
//         </body>
//         </html>`;

//         const browser=await puppeteer.launch()
//         const page=await browser.newPage()
//         await page.setContent(htmlContent)
//         const pdfbuffer=await page.pdf({
//             path:'report.pdf',
//             format:'A4',
//             displayHeaderFooter:true,
//             footerTemplate:`<div style="font-size: 12px; text-align: center; width: 100%;">Page <span class="pageNumber"></span></div>`,
//             margin: { top: "60px", bottom: "60px" }, 
//         })
//         await browser.close()
//         res.set({
//             'Content-Type':'application/pdf',
//             'Content-Disposition': 'attachment; filename="Patient_Report.pdf"'

//         })
//         res.send(pdfbuffer)
        


//     }catch(e){
//         console.error('errro in generating a report...',e)
        
//     }

// })

// app.post('/sendrepo',async(req,res)=>{
//     try{
//         const {repoId,nurseassesment,docId}=req.body
//         // let amuser=req.user.nurse? req.user.user:req.user
//         // const userId=amuser._id
//         console.log('docId...',docId)
//         const userId="BM382487"
//         const db=await getdb()
//         const repocollection=await db.collection('reports')
//         const docrepos=await db.collection('docreports')
//         const doctors=await db.collection('doctors')
//         // const myimage=amuser.image?amuser.image:" "

//         const doc=await doctors.findone({
//             _id:docId
//         })

//         if(!doc || doc.status!=="active"){
//             res.json({message:'Doctor not available , get another one'})
//         }
//         docdetails={
//             id:doc._id,
//             name:doc.name,
//             speciality:doc.speciality,
            
//         }

       
     
//         const instructions=`given the following statement ${nurseassesment} return only and only a one sentence summary , your response should be only and only the summary nothing else`
//         const summary=await getsummary(instructions)
//         const docsreport={
//             reportId:repoId,
//             sentdate:new Date(),
//             id:userId,
//             tname:'Brian Michaels',
//             image:"",
//             reportsummary:summary,
//             status:'pending'
//             }

//          await repocollection.updateOne(
//                 {
//                     _id:userId,
//                     "reports.reportId":new Date(repoId)
//                 },{
//                     $unset:{
//                         "reports.$.nurse.assesment":1
//                     }
//                 }
//          )


//         const [userreport,docreport]=await Promise.all([

//             repocollection.updateOne(
//                 {
//                     _id:userId,
//                     "reports.reportId":new Date(repoId)
//                 },{
//                     $set:{
//                         "reports.$.nurse.assesment":nurseassesment,
//                         "repors.$.doctor":docdetails
//                     }
//                 }
//             ),
//             docrepos.updateOne(
//                 {
//                     _id:docId,
//                     "reports.date":new Date().toISOString().split('T')[0]
//                 },
//                 {
//                     $push:{ 
//                         "reports.$.patients":docsreport
//                     }

//                 }
//             )

//         ])
//         if(userreport.modifiedCount>0 &&docreport.modifiedCount>0){
//             res.status(200).json({success:true ,message:'report sent to doctor successfully'})
//         }else{
//             console.log(`error in sending report \n ${userreport }\n ${docreport}`)
//             res.json({success:false,error:'failed to send report to doc'})
//         }

        

//     }catch(e){
//         res.status(400).json({message:`error in sending report to doc ${e}`})
//         console.error('error in sending report to doctor',e)
//     }

// })


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
