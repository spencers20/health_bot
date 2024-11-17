use('logs');

// db.createCollection('users')

// db.users.insertMany([
//     {

//         "name":"John"
//     }
// ])

// db.users.find()
// db.data.find()



// db.chat_histo.find()
// db.chat_histo.find(
//     {},
//     { "messages.type": 1, "messages.data.content": 1, "_id": 0 }
// )

// const chats=db.chat_histo.find({})
// console.log(chats)

// newchat={
//             chatId:'124u4iioioiuh444',
//             chatMessageId:'',
//             messages:[
//                 {
//                     onechat:[
//                         {
//                             type:'human',
//                             content:''
//                         },
//                         {
//                             type:'ai',
//                             content:''
//                         },
//                         {
//                             chattime:new Date()
//                         }
//                     ]
//                 }
//             ],
//             createdAt:new Date(),
//             updatedAt:new Date()

// }

    
// db.data.insertOne({
//     _id:1234566
// })


// const update=db.data.updateOne(
//     {
//         _id:1234566
//     },
//     {
//         $push:{
//             chats:newchat

//         }
//     }
// )

// if (update.acknowledged){
//     db.data.find()
// }
// userId=" 100984849132378172203"

// db.data.deleteOne({_id:userId})

const update=db.data.updateMany(
    {"activechatId":{$exists:true}},
    {$set:{"activechatId":null}}

)


if (update.acknowledged){
    db.data.find()
}

// const countexisting =db.data.countDocuments({"activechatId":null})


// if (countexisting >0){
//     const update=db.data.updateMany(
//         {"activechatId":{$exists:true}},
//         {$set:{"activechatId":"127"}}
    
//     )
    
//      if (update.acknowledged){
//         db.data.find() }

// } else{
//     console.log ("all have values")
// }

// db.data.find({ "_id": "114910775523649856248"})
// db.data.deleteMany({ "userId": "12345"})