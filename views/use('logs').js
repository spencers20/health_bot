use('logs')
// db.createCollection('history')

// db.history.insertMany([{
//     _id:"100984849132378172203",
//     tittle:"hello",
//     description:"hello world"
// }])

// const dates=new date()

// const result=db.history.insertMany([
//     {
//         _id:"12345556",
//         histories:[
//             {
//                 date:"12/12/2022",
//                 tittle:"greetings",
//                 descriptions:"hello world"
//             }
//         ]
//     }
// ])

// if (result.acknowledged){ 
//     db.history.find()
// }

// const result=db.history.bulkWrite([
//     {
//         updateOne:{
//             filter:{_id:"12345556"},
//             update:{
//                 $push:{
//                     histories:[
//                         {
//                             date:"12/12/2023",
//                             tittle:"greets",
//                             descriptions:"hello to the world"
//                         }
//                     ]
//                 }
//             }
//         }
//     }
// ])

// if (result.acknowledged){ 
//    
// }

// db.history.insert({
//     _id:"1234"
// })
db.history.find()