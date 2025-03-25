const express=require('express')
const router=express.Router()
const {getdb}=require('../config/database')
const {format, nextDay}=require('date-fns')
const {isAuthenticated}=require('../middleware/auth')


// router.use(async(req,res,next)=>{
//     if(req.isAuthenticated()){
//         next()
//     }else{
//         console.log('user unautheticated')
//         res.render('index.ejs')
//     }
// })

router.use(isAuthenticated);

router.use(express.json())

router.get('/',async(req,res)=>{
    try{
        console.log('doctor entered...')
        // const doc=req.user
        console.log("req.user",req.session.doc)
        
        res.render('docs.ejs')
    }catch(e){
        // res.render('index.ejs')
        console.error('error in getting to doctors page..',e)
    }                                                                                                                                                                                           
})

router.get('/logout',(req,res)=>{
    try{
        delete req.session.doc
        

    }catch(e){
        console.error('errror in logging out doctor',e)
    }
})

router.get('/docsname',async(req,res)=>{
    try{
        const docdetails=req.session.doc
        if(docdetails){

            console.log('docdetails..',docdetails)
            res.status(200).json(docdetails)
        }else{
            res.json({error:'errror in getting the docs name'})
        }

    }catch(e){
        console.log('error sending nurse and user',e)
    }
})

router.post('/getreport',async(req,res)=>{   //****for doctor
    try{
        const db=await getdb()
        const repocollection=await db.collection('reports')
        const historycollection=await db.collection('history')
        const {repoId,userId}=req.body

       const [thereport,histories]=await Promise.all([
           repocollection.findOne(
               { _id: userId },
               {
                   _id: 1, // Include the patient ID
                   name: 1, // Include the patient's name
                   birthdate: 1, // Include birthdate
                   gender: 1, // Include gender
                   reports: { $elemMatch: { reportId: repoId } } // Match the specific report
               }
            ),
           historycollection.aggregate([
                {
                    $match:{_id:"100984849132378172203"}
                },
                {
                     $unwind:"$histories"
                },
                {
                    $sort:{"histories.date":-1}
                },
                {
                 $group:{
                    _id:"$_id",
                    histories:{$push:"$histories"}
                 }
                }
            ]).toArray()
           
        ])
        if (!thereport || histories.length==0){
            res.status(200).json({message:'no reeport available'})
            return
        } 
        console.log(`report of ${userId} found`)
        console.log(histories)
        res.status(200).json({thereport,histories})



    }catch(e){
        console.error('error in getting single user reports...',e)
    }
})


router.post('/setdate',async(req,res)=>{
    try{

        const datenow=new Date()
        const formateddatenow=format(datenow,'yyyy-MM-dd')
        console.log('setdate entered...')
        const db=await getdb()
        const appmentcollection=await db.collection('docappointments')
        const docId=req.session.doc._id
        const meetdetails=req.body
        console.log(meetdetails)
        const datetoset=new Date(meetdetails.date)
        console.log('date to set..',datetoset)
        if(!isNaN(datetoset.getTime()) && datetoset>datenow){
            const doc=await appmentcollection.findOne({_id:docId})
            if(!doc){
               await appmentcollection.insertOne({
                _id:docId,
                appointmentdates:[]
            })
            }
            const insertdate=await appmentcollection.updateOne(
                {
                    _id:docId
                },
                { 
                    $push: { 
                        "appointmentdates": meetdetails ,
                        
                    } 
                }
            )
            console.log(insertdate)
            insertdate.modifiedCount>0?res.status(200).json(insertdate):console.error('error in inserting date to db')
        }else{
            res.json({message:'Please enter a valid date'})
        }

    }catch(e){
        console.error('error in setting date to db ',e)
    }
    

})


router.get('/getmypatients',async(req,res)=>{
    try{
        let mypatients
        console.log('getting my patients')
        const db=await getdb()
        const docappcollection=await db.collection('docappointments')
        const docId=req.session.doc._id
   
        mypatients= await docappcollection.findOne(
            {
                _id:docId
            }
        )

        console.log(mypatients)
        if(mypatients){
            res.status(200).json(mypatients)
        }else{
            mypatients=[]
            console.log("mypatients is null",mypatients)
            res.json(mypatients)
        }

    }catch(e){
        console.log("error in getting appointment requests...",e)
    }
})


router.post('/finishreport',async(req,res)=>{   //****for doctor
    try{
        const {reportId,docrecommendation,docassessment,patientId,sentdate}=req.body
        const db=await getdb()
        const docId=req.session.doc._id
        const repodate=new Date(sentdate).toISOString().split('T')[0]
        const [finishrepo,finishdoc]=await Promise.all([
            db.collection('docreports').updateOne(
                {    _id: docId,
                    "reports.date": repodate, 
                   "reports.patients.id": patientId
                },
                { $set: { "reports.$[report].patients.$[patient].status": "complete" } },
                {
                  arrayFilters: [
                    { "report.date": repodate },
                    { "patient.id": patientId }
                  ]
                }
              )
            ,
            await db.collection('reports').updateOne(
                {
                    _id:patientId,
                    "reports.reportId":new Date(reportId)
                },
                {   
                    $set:{
                       "reports.$.status":'complete',
                       "reports.$.doctor.assessment":docassessment,
                       "reports.$.doctor.recommendation":docrecommendation
                    }
                } && finishdoc.modifiedCount>0
            )

            
        ])
         console.log(finishrepo)
        if(finishrepo.modifiedCount>0){
            console.log(`in doc details ${finishrepo} and in reports `)
            res.status(200).json({success:true ,message:"report finished success"})
        }else{
            res.json({success:false, error:"report not finished"})
        }
    }catch(e){
          console.log('error in finishing report....',e)
          res.json({error:"error in finishing report",e })
    }

})

router.post('/setavailability',async(req,res)=>{ //****for doctor
    try{
        const {status}=req.body
        console.log('status...',status)
        const db=await getdb()
        const docscollection=await db.collection('doctors')
        const docrepos=await db.collection('docreports')
        const docId=req.session.doc._id

        

        await docscollection.updateOne(
            { _id: docId },
            { $unset: { status: "" } } // Removes the field
        );

        const statusresults=await docscollection.updateOne(
            {
                _id:docId
            },
            {
                $set:{
                    "status":status
                }
            }
        )

        if(statusresults.modifiedCount>0){
            const doc=await docscollection.findOne(
                {
                    _id:docId
                }
            )
            // console
            if(doc.status=='active'){
                const docfound = await docrepos.findOne(
                    {
                        _id: docId,
                        "reports.date": new Date().toISOString().split('T')[0] // Correct way to filter
                    },
                    {
                        "reports.$": 1 // Only return the matched report
                    }
                );

                let newdate
                if(!docfound){
                    console.log('doc not found')
                    newdate=await docrepos.updateOne(
                        {
                            _id:docId,
                            
                        },
                        {
                            $push:{
                                "reports":{
                                    "date": new Date().toISOString().split('T')[0],
                                    "patients":[]
                                } 
                            }
                        }
                    )

                    console.log(newdate)
                }
                if(docfound || newdate.modifiedCount>0){
                    res.status(200).json({message:'status set to active '})
                }else{
                    res.json({message:"error in setting active"})
                }

            }else{
                res.status(200).json({message:'You have successfully closed your session'})
            }
        }else{
            res.json({error:'error in updating doctors status'})
        }


    }catch(e){
        console.error('error in updating status',e)
        res.json({error:'error in updating status'})
    }
})

router.get('/reportpatients', async(req,res)=>{  //****for doctor
    try{
        const db=await getdb()
        const docrepos=await db.collection('docreports')
        docId=req.session.doc._id
        const reports=await docrepos.findOne({
            _id:docId
        })

        if(!reports){
                await docrepos.insertOne(
                    {
                        _id:docId,
                        reports:[]
                    }
                )
                const reports=[]

                res.status(200).json({reports})
            
        }

        res.status(200).json(reports)


    }catch(e){
        console.log('error in getting the patients with reports' )
    }
})





module.exports=router