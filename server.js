const express=require('express')
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
const Pdfdocument=require('pdfkit')
const fs =  require('fs');
const { get } = require('http');


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
    res.render('entries.ejs')
})
// app.get('/symptomchecker',(req , res)=>{
//     console.log('entered')
//     res.render('symptom.ejs')
    
// })




app.get('/tips',async(req , res)=>{
    try{
        console.log('tips url entered...')
        const db=await getdb()
        const tipscollection=db.collection('tips')
        const tipsindb= await tipscollection.find().toArray()
        // console.log(tipsindb)

        res.status(200).json(tipsindb)
 
    }catch(e){
        console.error(`error in getting tips from db : ${e}`)
    }

    
})

app.get('/entries', async(req,res)=>{
    try{
        console.log('entries url entered...')
        const db=await getdb()
        const collection=db.collection('history')
        const entries=await collection.aggregate([
            { $match:{_id:"100984849132378172203"}

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
        ]).toArray()
        console.log(entries)

        // return entries
        res.status(200).json(entries)
        console.log("entries retrieved successful")
      

    } catch(e){
        console.log(`error in getting entries : ${e}`)
    }
})

app.get('/history',async (req,res)=>{
    try{

        const db=await getdb();
        const datacollection=db.collection('data')
        const data= await datacollection.aggregate([
            {$match:{
                _id :"100984849132378172203"
            }},
            { $unwind : "$chats"

            },
            { $sort :{
                "chats.updatedAt":-1
            }
             },
             {$group:{
                _id:"_id",
                chats:{
                    $push:"chats"}
             }
             }
        ])

        res.status(200).json(data)

    }catch(e){
        console.error(`error in getting data from db : ${e}`)
        res.status(500).json({errorgettingdata: `${e}`}) 
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
app.get('/download', async(req,res)=>{
    try{
        let keydatess

        const keydates=req.query.keydate
        const db=await getdb()
        const collection=db.collection('history')
        console.log('keydates to download', keydates)
        console.log(Array.isArray(keydates))
        
        if(!Array.isArray(keydates)){
            keydatess=[keydates]
            console.log(Array.isArray(keydatess))
            console.log("array keydates",keydatess)

            for(const datess of keydatess){
                const date=new Date(datess)
                console.log(date)

                const downloaddata =await collection.find({
                    _id:"100984849132378172203",
                    "histories.date":date
                },
                {
                    "histories":{$elemMatch:{date:date}}
                }
            )
            console.log("downloaddata", downloaddata)
            }
        }
        
    
        // for(const dates of keydatess){
        //     const date=new Date(dates)
        //     console.log(date)

            // data = await collection.findOne(
            //     {
            //         _id:"100984849132378172203",
            //         "histories.date":date
            //     },
            //     {
            //         "histories":{$elemMatch:{date:date}}
            //     }
            // ) 
        // } 
        // console.log('data to download',data)
    }catch(e){
        console.log('error in downloading data',e)
    }
    

})

app.post('/delete',async(req,res)=>{
    try{
        const keydates=req.body
        // console.log(req.body)
        const db=await getdb()
        const collection=db.collection('history')
        console.log('keydates in delete', keydates)

        for(const dates of keydates){
            const date=new Date(dates)
            console.log(date)

            const deleteresult=await collection.updateOne(
                {
                _id:"100984849132378172203",
                "histories.date":date,
                "histories":{$elemMatch:{date:date}}
                },
                {
                    $pull:{ "histories":{date:date}}
                }
         
        )
        if(deleteresult.modifiedCount>0){
            console.log("deleted successfully")
            res.status(200).json({success:true})
        }
        }
    }catch(e){
        console.log('errror in deleting data ', e)
    }
})

app.post('/updates',async(req,res)=>{
    try{

        const keydates=req.body.keydate
        // keydates=keydates.
        const db=await getdb()
        const collection=db.collection('history')
        console.log("keydates", keydates)
        for(const dates of keydates){
            date= new Date(dates)
            console.log(date)
             
            const results=await collection.updateOne(
                {_id:"100984849132378172203",
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


    }catch(e){
        console.log('error in updating',e)
    }
})



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
app.listen(3001 ,()=>{
  
    console.log("listening at :http://localhost:3001")
})
})

