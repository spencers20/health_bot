const express=require('express')
const router=express.Router()
const passport=require('passport')
const {getdb,sendmail}=require('../config/database')
const bcrypt=require('bcrypt')
const multer=require('multer')
const { file } = require('pdfkit')
const {generatemyid,querymodel}=require('../config/reuse')




router.use(express.json())

const storage=multer.diskStorage({
    destination:(req, file,cb)=>{
        cb(null,'images/')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+file.originalname)
    }
})

const fileFilter=(req,file,cb)=>{
    const allowedtypes=['image/jpeg', 'image/png', 'image/avif', 'application/pdf']
    allowedtypes.includes(file.mimetype)?cb(null,true):cb(new Error('Invalid file'))

}
const upload=multer({storage,fileFilter})

//creating user doctor to the system
router.post('/createdoc',upload.single('photo'),async(req,res)=>{
    try{
        const db=await getdb()
        let docname=req.body.name
        const instruction=`given the following speciality of a doctor ${req.body.speciality} generate a brief description about speciality example for GP , "Provides general healthcare and treats common illnesses."your response should   return only the brief description nothing more and should generally have a maximum of 8 words only`
        const description=await querymodel(instruction)
        const docs=await db.collection('doctors')
        const doclicense=await docs.findOne({licensenumber:req.body.licensenumber})
        if(doclicense){
            res.status(200).json({message:'Doctor already in system,'})
            return
        }
        
        let docid
        let docidindb
        let attempts=0
        let maxattempts=10
        do{
           const genid=generatemyid(docname)
           docid='D'+genid.slice(2,9)+genid.slice(0,2)
           docidindb=await docs.findOne({
            _id:docid
           })
           attempts++
           if(attempts>maxattempts){
            throw new Error('Failed to generate docid, try again')
           }
            
        }while(docidindb)

        const  doctor={
            _id:docid,
            name:docname,
            id:req.body.id,
            licensenumber:req.body.licensenumber,
            speciality:req.body.speciality,
            description:description,
            phone:req.body.phonenumber,
            birthdate:req.body.birthdate,
            image:`http://localhost:3000/${req.file.path}`,
            imagefileType:req.file.mimetype,
            role:'Doctor',
            status:'closed'

        }
        console.log('doctor details/..',doctor)
        
        const insertdoc=await docs.insertOne(doctor)
        console.log('inserteddoc....',insertdoc)
        if(insertdoc.acknowledged){
            const email=req.body.email
            console.log('new doctoe created')
            const subject='Doctor Account created successfully'
            const body=`Here is your Doctor Id  ${docid}, use it as your username to login into your app , use  your national id as your password`
            const sentmail=await sendmail(email,subject,body)
            console.log('email sent...',sentmail)

            if(insertdoc.insertedId==docid ){
                console.log('Doctor...inserted successfully...',docid)
                sentmail.accepted.length>0?res.status(200).json({message:'The Doctor has been added successfully. Please ask them to check their email for further details.'}):res.status(200).json({message:'Doctor created successfully, check db for details'})

                }

        }

    }catch(e){
        console.log('error in creating doc..',e)
        res.json({error:'error in creating doc'})
    }
})

router.post('/createnurse',upload.single('photo'),async(req,res)=>{
    try{
        const db=await getdb()
        let nursename=req.body.name
        const imageurl=req.file?`http://localhost:3000/${req.file.path}`:''
        const imagefiletype=req.file?req.file.mimetype:''
        const nursecollection=await db.collection('nurses')
        const nurseindb=await nursecollection.findOne({
            licensenumber:req.body.licensenumber
        })   
        if(nurseindb){
            res.status(200).json({message:'Nurse already in system,'})
            return
        }
        
        let nurseid
        let nurseidindb
        let attempts=0
        let maxattempts=10
        do{
            const genid=generatemyid(nursename)
            nurseid='N'+genid.slice(2,9)+genid.slice(0,2)
            nurseidindb=await nursecollection.findOne({
                _id:nurseid
            })
            attempts++

            if(attempts>maxattempts){
                throw new Error('Maximum attempts reached , try again to add nurse to system')
            
            }

        }while(nurseidindb)
       
        const  nurse={
            _id:nurseid,
            name:nursename,
            id:req.body.id,
            licensenumber:req.body.licensenumber,
            phone:req.body.phonenumber,
            birthdate:req.body.birthdate,
            email:req.body.email,
            image:imageurl,
            fileType:imagefiletype,
            role:'Nurse',
            status:'active'

        }
       
        const insertnurse=await db.collection('nurses').insertOne(nurse)
        if(insertnurse.acknowledged){
            const email=req.body.email
            console.log('new nurse created')
            const subject='Nurse Account created successfully'
            const body=`Here is your Nurse Id  ${nurseid}, use it as your username to login into your app , use  your national id as your password`
            const sentmail=await sendmail(email,subject,body)
            console.log('email sent...',sentmail)

            if(insertnurse.insertedId==nurseid ){
                console.log('user...inserted successfully...',nurseid)
                sentmail.accepted.length>0?res.status(200).json({message:'The nurse has been added successfully. Please ask them to check their email for further details.'}):res.status(200).json({message:'Nurse created successfully, check db for details'})

                }

        }

    }catch(e){
        console.log('error in creating nurse..',e)
        res.json({error:'error in creating nurse'})
    }
})

router.post('/createadmin',upload.single('photo'),async(req,res)=>{
    try{
        const db=await getdb()
        let adminname=req.body.name

        const admins=await db.collection('administrator')
        const alladmins=await admins.find().toArray()
        if(alladmins.length===4){
            res.status.json({message:'maximum number of admins in system,remove one to add'})
            return
        }
        const existingadmin=await admins.findOne({id:req.body.id})
        if(existingadmin){
            res.status(200).json({message:'Doctor already in system,'})
            return
        }
    
        let adminid
        let adminindb
        let attempts=0
        let maxattempts=10
        do{
           const genid=generatemyid(adminname)
           adminid='AM'+genid.slice(2,9)+genid.slice(0,2)
           adminindb=await admins.findOne({
            _id:adminid

           })
           attempts++
           if(attempts>maxattempts){
            throw new Error('Failed to generate docid, try again')
           }
            
        }while(adminindb)

        const  admin={
            _id:adminid,
            name:adminname,
            id:req.body.id,
            phone:req.body.phonenumber,
            email:req.body.email,
            birthdate:req.body.birthdate,
            image:`http://localhost:3000/${req.file.path}`,
            imagefileType:req.file.mimetype,
            type:req.body.role,
            role:'Admin'
        }
        console.log('admin details/..',admin)
        
        const insertedadmin=await admins.insertOne(admin)
        console.log('inserteddoc....',insertedadmin)
        if(insertedadmin.acknowledged){
            const email=req.body.email
            console.log('new Admin created')
            const subject='Admin Account created successfully'
            const body=`Here is your Admin Id  ${adminid}, use it as your username to login into your app , use  your national id as your password`
            const sentmail=await sendmail(email,subject,body)
            console.log('email sent...',sentmail)

            if(insertedadmin.insertedId==adminid ){
                console.log('Admin...inserted successfully...',adminid)
                sentmail.accepted.length>0?res.status(200).json({message:'The Doctor has been added successfully. Please ask them to check their email for further details.'}):res.status(200).json({message:'Doctor created successfully, check db for details'})
                }

        }

    }catch(e){
        console.log('error in creating admin..',e)
        res.json({error:'error in creating admin'})
    }
})

router.get('/',
    passport.authenticate('google', { scope: ['profile','email'] })
);
  
router.get('/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      req.session.user=req.user
      res.redirect('/user');
});

//add user to the system
router.post('/createuser',async(req,res)=>{
    try{
        console.log('creating user...')
        const {myname,mail,password,gender,birthdate,disordervalue}=req.body
        const  db=await getdb()
        const usercollection=await db.collection('users')
        console.log(`credentials ..${myname},.${mail}.${password}`,)
        // const userpassword=credentials.password
        const hashedpassword=await bcrypt.hash(password,10)
        // const myname=credentials.name
        // const mail=credentials.email
        let myid;
        let user;
        let attempts=0
        let maxattempts=10
        do{
            myid=generatemyid(myname)
            user=await usercollection.findOne({_id:myid})

            attempts++

            if(attempts>maxattempts){
                throw new Error('Maximum attempts reached , try again to add nurse to system')
            
            }

        } while(user)

        const mycredentials={
                _id:myid,
                name:myname,
                email:mail,
                password:hashedpassword,
                age:birthdate,
                gender:gender,
                role:'PersonOfCare',
                disorder:disordervalue
            }

        const newuser=await usercollection.insertOne(mycredentials)
        if(newuser.acknowledged){
            console.log('new user created')
            const subject='Your userId'
            const body=`Here is your userId , use it as your username to login into your app  ${myid}`
            const sentmail=await sendmail(mail,subject,body)
            console.log('email sent...',sentmail)

            if(newuser.insertedId==myid){
                console.log('user...inserted successfully...',myid)
            }

            res.status(200).json(newuser)
        }
  

     }catch(e){
        console.error('error in creating user...',e)
    }

})



router.post('/loginuser', (req, res, next) => {
    console.log('Incoming login request:', req.body); // Debugging log

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('❌ Passport authentication error:', err);
            return res.status(500).json({ error: 'Authentication failed' });
        }
        if (!user) {
            console.log('❌ Invalid credentials:', info);
            return res.redirect('/login'); // Redirect on failure
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('❌ Login error:', err);
                return res.status(500).json({ error: 'Login failed' });
            }

            console.log('✅ User authenticated:', user);
            
            // Redirect based on user role
            if (user.role === 'PersonOfCare') {
                console.log('user is personof care')
                req.session.user=req.user
                   return res.json({redirect:'/user'});
                // return res.render('chat.ejs',{user})
             } else if (user.role === 'Doctor') {
                console.log('user is a doctor')
                req.session.doc=req.user
                return res.json({redirect:'/doctors'});
            } else {
                req.session.admin=req.user
                return res.json({redirect:'/admin'});
            }
        });
    })(req, res, next); // Call Passport manually
});


router.post('/usernurse',
    passport.authenticate('nurse-user', {failureRedirect:'/login'}),
    (req,res)=>{
        req.session.user=req.user.user
        req.session.nurse=req.user.nurse
        return res.json({redirect:'/user'})
    }
)


module.exports= router