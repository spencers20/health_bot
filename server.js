const express=require('express')
const {savesession,getcollection,initializecollection }= require('./config/database')
const app=express()
const session = require("express-session");
const passport = require("passport");
require('./config/passport')
const google=require('./routes/google') //calling the google. route
require('dotenv').config()
const user=require('./routes/user')
const path=require('path')

// const collection=require('./database')
// const collection=savesession.collection

// getting views 
app.set('views','./views')
app.set('view_engine','ejs')

//serve static files
app.use(express.static(path.join(__dirname,'public')))


// Set up session management and passport globally
app.use(session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// getting the routes 
app.use('/google',google)
app.use('/user',user)

app.use(express.json())

app.get('/',(req , res)=>{
    console.log('entered')
    res.render('chat.ejs')
})



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
        const {message}=req.body

        const data={
            question : message,
            chatId : '2244fb1a-03ba-492b-ae8e-de9a9823eb91',
            
        }
        
        const response = await fetch(
            "http://20.86.249.39:3000/api/v1/prediction/45f5a627-3b9d-4f90-a7df-597c1729b0f1",
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
        const saved = await savesession(result)
        console.log(saved)
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

initializecollection().then(()=>{
app.listen(3000 ,()=>{
  
    console.log("listening at :http://localhost:3000")
})
})

