use('logs')
// db.history.find({ "histories": { $exists: true } }).pretty()

// db.history.deleteMany({_id:"100984849132378172203"})

db.history.find({
    _id:"100984849132378172203",
    "histories.tittle":"head"
},
{

    "histories":{$elemMatch:{tittle:"head"}}
}
)


// try{
//     date1=ISODate("2025-01-10T20:24:32.348Z")
//     date2=ISODate("2025-01-08T19:47:24.924Z")
//     date3=ISODate("2025-01-11T11:57:55.761Z")
//     console.log(date1)

    
//     keys=[date1,date2,date3]


    
        
//      await Promise.all(
//             keys.map(date=>{
//                 db.history.updateOne(
//                     {
//                     _id:"112134851760110233085",
//                     "histories.date":date,
//                     "histories":{$elemMatch:{date:date}}
                       
//                     },
//                     {$set :{"histories.$.status":"starred"}}
//                 )
//                 })
//             )
    
// }catch(e){
//     console.log("error ",e)
// }


// console.log(JSON.stringify({keys}))

// const results = db.history.findOne(
//     {
//         "histories.date":date
//     },
//     {
//         "histories": {
//             $elemMatch: {
//                 date: date
//             }
//         }
//     }
    
// )

// console.log(results);

// db.history.updateOne(
//     {_id:"100984849132378172203",
//         "histories.date":date,
//         "histories":{$elemMatch:{date:date}}
//     },
//     {$set :{"histories.$.status":"active"}}
// )


// const result=db.history.bulkWrite([{
//     updateMany: {
//         filter:{"histories.tittle":"ear bussing"},
//         update:{$set:{"histories.status":"starred"}}
//     }
// }])

// if (result.acknowledge){
//     db.history.find()
// }

// db.history.find({
//     "histories": { $elemMatch: { "tittle": "ear bussing" } }
//   }).pretty()
  