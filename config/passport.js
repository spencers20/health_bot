const {getdb}=require('./database')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config()



passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3000/google/callback",
    scope: ["profile", "email"]
}, 
async  function (accessToken, refreshToken, profile, done){

    try{
        const db=await getdb();
        const User =db.collection('users')
        const user= await User.findOne({googleId:profile.id})
        const data=db.collection('data')
        
        // console.log(userid)

        if (!user){
            const google_details={
                googleId:profile.id,
                name:profile.displayName,
                email:profile.emails[0].value
            }

            const details=await User.insertOne(google_details)
            console.log(details)

            
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


passport.serializeUser((user,done)=>{
    done(null,user.googleId)
})

passport.deserializeUser(async   (googleId,done)=>{
    try {
        const db=await getdb();
        const User =db.collection('users')
        const user = await User.findOne({googleId:googleId});
        done(null, user);
      
    } catch (err) {
        done(err, null);
      }
})



