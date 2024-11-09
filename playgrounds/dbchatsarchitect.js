use('logs')

// const delet=db.data.deleteMany({userId:"12345"})

// if (delet.acknowledged){
//     db.data.find()
// }

// db.data.find({chatId : '2244fb1a-03ba-492b-ae8e-de9a9823eb91'})

//  const result = db.data.findOne({
//     _id: ObjectId('672d4df7fa6fc8be7a24f65e')
//  })

// if (result){
//     console.log('id exists')
// }




// const log ={
//     _id:new ObjectId('672d4d9dfa6fc8be7a24f65d'),
//     chats:[
//         {
//             chatId:'',
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
//         }
//     ]
// }

// db.data.insertOne(log)

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

// db.data.updateOne(
//     {_id: ObjectId('672d4d9dfa6fc8be7a24f65d')},
//     {
//         $push:{
//             chats:newchat
//         }
//     }
// )

// db.data.find(
//     {
//         _id: ObjectId('672d4d9dfa6fc8be7a24f65d'),
//         'chats.chatId':'124u4iioioiuh444'
//     },
//     {
//         chats :{
//             $elemMatch: {
//                chatId: '124u4iioioiuh444'
//             }
//         }
//     }

// )

db.data.insertOne({
    _id:1234566
})