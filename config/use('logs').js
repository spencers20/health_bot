use('logs')
// db.docappointments.insertOne(
//     {
//         _id:'D126041MA'
//         appointmentdates:[
//             {
//                 date:'',
                   mysessions:''
//                 patients:[{
//                     name:'',
//                     pic:'',
//                     description:'',
//                     session:'',
//                     state:'accepted/declined/pending'
//                 }]
//             }

//         ]
//     }
// )

// db.docappointments.insertOne(
//     {
//         _id:"D126041MA"
        
//     }
// )

// [
//     {
//       "_id": "D123478JO",
//       "reports": [
//         {
//           "date": "2025-03-16",
//           "patients": []
//         }
//       ]
//     }
//   ]

const date=new Date().toISOString().split('T')[0]
const userId="D876543MW"
// // const reportId="2025-03-15T16:12:38.193Z"
// db.docreports.updateOne(
//     {
//         _id: "D123478JO", // Replace with your actual docId
//         "reports.date": "2025-03-16" // Match the specific report date
//     },
//     {
//         $set: {
//             "reports.$.date":date // Set patients array to empty
//         }
//     }
// );

db.docreports.find()
// db.docappointments.findOne({ _id: "D123478JO" });

// db.docappointments.aggregate([
//     {$match:{_id:"D123478JO"}},
//     {$unwind:"$appointmentdates"},
//     {
//         $match:{"appointmentdates.date":{$gt:new Date(new Date().toISOString().split("T")[0]) }}
//     },
//     {
//         $project:{
//             _id:0,
//             date:"$appointmentdates.date",
//             mysessions:"$appointmentdates.mysessions",
//             time:"$appointmentdates.appointmenttime",
//             numvisits:"$appointmentdates.numvisits",
//             patients:"$appointmentdates.patients"
//         }
//     }
// ]).toArray()


// db.docappointments.updateOne(
//     { _id: "D126041MA" },
//     { 
//         $push: { 
//             appointmentdates: { 
//                 $each: [
//                     { date: new Date("2025-03-20T00:00:00.000Z"), mysessions: "Afternoon" },
//                     { date: new Date("2025-03-21T00:00:00.000Z"), mysessions: "Both" },
//                     { date: new Date("2025-03-22T00:00:00.000Z"), mysessions: "Morning" },
//                     { date: new Date("2025-03-23T00:00:00.000Z"), mysessions: "Afternoon" },
//                     { date: new Date("2025-03-24T00:00:00.000Z"), mysessions: "Both" }
//                 ] 
//             }
//         }
//     }
// );
