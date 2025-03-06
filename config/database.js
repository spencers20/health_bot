
const{MongoClient, ServerApiVersion}=require('mongodb')

require('dotenv').config()
    // get the uri from the .env
const uri =process.env.MONGO_URI
const client=new MongoClient(
    uri,
    {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
            }
        }
)
let collection;
let db;
async function initializecollection(){
    
        try{
            // connect to the database
            await client.connect()
            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
            db=client.db('logs')
            collection=db.collection('data')
            // 
        }catch(e){
            console.error({dbconnecterror:`${e}`})
        }  
    // get the database and collection to store the data 
    
}
 initializecollection()

function getcollection(){
    if (!collection){
        throw new error("collection is not initialized")
    }
    return collection
}
//  console.log(collection

function getdb(){
    if (!db){
        throw new error("database is not initialized")
    }
    return db
}
    
async function savesession(result){
    
    
    const sessiondata ={
        userId:"12345",
        sessionId:result.sessionId,
        chatId:result.chatId,
        chatMessageId:result.chatMessageId,
        messages:[
            {type:"human", content:result.question},
            {type:"ai", content:result.text}
        ],
        createdAt:new Date(),
        updatedAt:new Date()

    }

    const added=await collection.insertOne(sessiondata)

    if (added.acknowledged){
        console.log("added to the database successfully")
    }

    return  added
    
}

async function resetactiveChatIds(){
    try{
    const activChats= await collection.countDocuments({"activechatId":{$exists:true}})
    console.log(`activechatIds: ${activChats}`)

    await collection.updateMany(
        {"activechatId":{$exists:true}},
        {$set:{"activechatId":null}}
    
    )
    console.log(`Successfully Reset activeChatIds : ${activChats}`)
    
    console.log('cron schedule completed successfully')

    }catch(e){
        console.log("error in reseting activeChatId",e )
    }
} 


function generatemyid(myname){
    let letters;
    const randomnumber=Math.floor(Math.random()*1e10).toString()
    const number=randomnumber.slice(0,6)
    console.log('random number generated...',number)

    const name=myname.trim().split(" ") //split name to an array
    if (name.length<2){
        letters=name[0][0].toUpperCase()+name[0][2].toUpperCase()
    }else{
        letters=name[0][0].toUpperCase()+name[1][0].toUpperCase()
    }

    const myid=letters+number
    console.log('geneeratesd id..',myid)
    return myid
}

//function to sendmail
async function sendmail(to,subject,body){
    try{

        const transporter=nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            auth:{
                user:"spencernyaenya@gmail.com",
                pass:"jiml nuuw vmui glda"
            }
        }
        )
    
        const aboutmail={
            from:'"Afyasphere" <spencernyaenya@gmail.com>',
            subject:subject || 'Health update',
            text:body,
            to:to
        }
        const infomail= await transporter.sendMail(aboutmail)
        console.log(infomail)
        return(infomail)
    }catch(e){
        console.error('error in sending email...',e)
    }
}


module.exports={savesession, generatemyid, sendmail,initializecollection, getdb, resetactiveChatIds}
// module.exports =savesession.collection
