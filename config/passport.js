const {getdb}=require('./database')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config()
const LocalStrategy=require('passport-local').Strategy
const bcrypt=require('bcrypt')
const {generatemyid}=require('../config/database')
const axios =require('axios')
// import {getdb} from './database'


passport.use('google',new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/google/callback",
    scope: ["profile", "email","https://www.googleapis.com/auth/userinfo.profile"]
}, 
async  function (accessToken, refreshToken, profile, done){

    try{
        //you can still make use of fetch , but in the headers add "accept":application/json
        //axios automatically sets the accept
        //accessToken is automatically provided in the callback
        // const response=await axios.get(
        //     "https://www.googleapis.com/auth/user.gender.read",
        //     {
        //         headers:{
        //             "Authorization":`Bearer ${accessToken}`
        //         }
        //     }

        // )

        // const response=await fetch("https://people.googleapis.com/v1/people/me?personFields=genders,birthdays",{
        //     method:'GET',
        //     headers:{
        //          "Authorization":`Bearer ${accessToken}`,
            

        //     }
        // })
        // console.log(response)
        // const myprof=await response.json
        // console.log('my profile..',myprof)
        // const gender=myprof.genders?myprof.genders[0].value:'Gender not available'
        // const birthdate=myprof.birthdays?myprof.birthdays[0].value:'Birthdate not available'

        // function calculateAge(birthYear, birthMonth, birthDay) {
        //     const today = new Date();
        //     const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
        
        //     return new Intl.DateTimeFormat('en', { year: 'numeric' }).format(today) - 
        //            new Intl.DateTimeFormat('en', { year: 'numeric' }).format(birthDate);
        // }
        //  const age=calculateAge(birthdate.year,birthdate.month,birthdate.day)
        
        

        const db=await getdb();
        const User =db.collection('users')
        const user= await User.findOne({googleId:profile.id})
        const data=db.collection('data')

        
        // console.log(userid)

        if (!user){
            const myname=profile.displayName
            let myid;
            let idmine;
            do{
                myid=generatemyid(myname)
                idmine=await User.findOne({_id:myid})
            }while(idmine)

            if(!idmine){
                const google_details={
                    _id:myid,
                    googleId:profile.id,
                    name:profile.displayName,
                    email:profile.emails[0].value,
                    role:'PersonOfCare'
                    // gender:gender,
                    // age:age
                    
                }
    
                const details=await User.insertOne(google_details)
                console.log(details)
            }
  
            
            // if (details.acknowledged){
            //     console.log(details)
            // }
           
            const newuser=await User.findOne({googleId:profile.id})
            return done(null,newuser)
        }



        return done(null,user)
    }catch(e){
        return done(e,null)
    }
    
}

))


passport.use('local',new LocalStrategy(
    { usernameField: 'userId', passwordField: 'password' },
    async(userId,password,done)=>{
        try{
            console.log('passport aunthenticating....')
            const db=await getdb();
            const User =db.collection('users')
            const Nurse=await db.collection('nurses')
            const Doctor=await db.collection('doctors')
            const user= await User.findOne({_id:userId}) ||await Nurse.findOne({_id:userId}) || await Doctor.findOne({_id:userId})
            console.log('user found....',user)
            if(!user){
                console.log('user not found...',userId)
                return done(null, false,{message:"user not found"})
            } 
            if(user.role=='Doctor' && user.id==password){
                console.log('doctor authenticated')
                return done(null,user)
                
            }else if(user.role=='admin'&& user._id==password){
                console.log('doctor authenticated')
                return done(null,user)
            }
            const verified=await bcrypt.compare(password,user.password)
            if(!verified){
                console.log('incorrect password for ..',userId)
                return done(null,false,{message:'incorrect password'})
            }
    
            console.log('user authenticated..',user)
            return done(null,user)

        
        }catch(e){
            console.error('error in authenticating user')
            return done(e)
        }
    }
))

passport.use('nurse-user',new LocalStrategy(
    { usernameField: 'userId', passwordField: 'nurseId' },
   async(userId,nurseId,done)=>{
    try{

        const db=await getdb()
        const User=await db.collection('users')
        const Nurse=await db.collection('nurses')
        
        const user=await User.findOne({_id:userId})
        if(!user){
            console.log('user not found...',userId)
            return done(null,false,{message:'user not found'})
        }
        const nurse=await Nurse.findOne({_id:nurseId})
        if(!nurse){
            console.log('user not found...',nurseId)
            return done(null,false,{message:'Invalid Nurse ID'})
        }

        return done(null,{user,nurse})
    }catch(e){
        console.log('error in logging user via nurse..',e)
        return done(e)
    }



    }
))

passport.serializeUser((authData,done)=>{
    if (!authData) {
        console.error('❌ authData is undefined!');
        return done(new Error('User data missing in serialization'));
    }
    if(!authData.nurse){
        console.log(authData)
        done(null,authData._id)
    }else{

        done(null,{userId:authData.user._id, nurseId:authData.nurse._id})
    }
})

passport.deserializeUser(async(data,done)=>{
    try {
        const db=await getdb();
        const User =db.collection('users')
        const Nurse=db.collection('nurses')
        // const user = await User.findOne({_id:data.userId});
        if (typeof data === 'object' && data.userId) {
            // Nurse-based authentication
            const user = await User.findOne({ _id: data.userId });
            const nurse = await Nurse.findOne({ _id: data.nurseId });
            return done(null, { user, nurse });
        } else {
            // Regular user authentication
            const user = await User.findOne({ _id: data });
            return done(null, user);
        }
          
      
    } catch (err) {
        done(err, null);
      }
})



