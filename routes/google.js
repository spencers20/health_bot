const express=require('express')
const router=express.Router()
const passport=require('passport')
const {getdb,generatemyid,sendmail}=require('../config/database')
const bcrypt=require('bcrypt')


router.use(express.json())


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
        const {myname,mail,password}=req.body
        const  db=await getdb()
        const usercollection=await db.collection('users')
        console.log(`credentials ..${myname},.${mail}.${password}`,)
        // const userpassword=credentials.password
        const hashedpassword=await bcrypt.hash(password,10)
        // const myname=credentials.name
        // const mail=credentials.email
        let myid;
        let user;
        do{
            myid=generatemyid(myname)
            user=await usercollection.findOne({_id:myid})

        } while(user)

        const mycredentials={
                _id:myid,
                name:myname,
                email:mail,
                password:hashedpassword,
                role:'PersonOfCare'
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


// router.post('/loginuser', async (req, res) => {
//     try {
//         console.log('Logging in user...');
        
//         const { userId, password } = req.body;
//         console.log('User ID:', userId);

//         const db = await getdb();
//         const userCollection = db.collection('users');

//         // Fetch user from DB
//         const user = await userCollection.findOne({ _id: userId });

//         // Handle invalid user
//         if (!user) {
//             console.log('User not found');
//             return res.status(400).send('Please enter a valid ID');
//         }

//         // Verify password
//         const confirmedPass = await bcrypt.compare(password, user.password);
//         if (!confirmedPass) {
//             console.log('Incorrect password');
//             return res.status(400).send('Enter the correct password');
//         }

//         console.log('User authenticated:', user);

//         // Redirect to user page
//         return res.redirect('/user');

//     } catch (e) {
//         console.error('Error in logging in user:', e);
//         return res.status(500).send('Internal Server Error');
//     }
// });



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
                // req.session.user=req.user
                   return res.json({redirect:'/user'});
                // return res.render('chat.ejs',{user})
            } else if (user.role === 'doctor') {
                return res.json({redirect:'/doctor'});
            } else {
                return res.json({redirect:'/nurse'});
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