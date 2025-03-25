use('logs')
// db.history.aggregate([
//     {
//         $match: {
//             _id: "100984849132378172203",
//             "histories.status": "starred"
//         }
//     },
//     {
//         $project: {
//             histories: {
//                 $filter: {
//                     input: "$histories",
//                     as: "history",
//                     cond: { $eq: ["$$history.status", "starred"] }
//                 }
//             }
//         }
//     },
//     {
//         $unwind: "$histories"
//     },
//     {
//         $sort: {
//             "histories.date": -1
//         }
//     },
//     {
//         $group: {
//             _id: "$_id",
//             histories: {
//                 $push: {
//                     date: "$histories.date",
//                     title: "$histories.title", // Corrected from `tittle`
//                     description: "$histories.description",
//                     summary: "$histories.summary"
//                 }
//             }
//         }
//     }
// ]);

// db.history.find({
//     _id:"100984849132378172203"
// })

// db.tips.updateOne(
//     {
//         "tittle":"Eat a Balanced Diet"
//     },
//     {
//         $set:{image:"https://www.healthxchange.sg/sites/hexassets/Assets/diabetes/hpb-healthy-plate.jpg"}
//     }
// )

// db.reports.updateOne(
//     {
//         _id: "BM382487",
//         "reports.reportId":new Date("2025-03-16T11:12:45.735Z")
//     },
//     {
//         $unset: { "reports.$.nurse.assesment": ""}  // ✅ Removes the `assesment` field
//     }
// );
const date=new Date("2025-03-17").toISOString().split('T')[0]

db.docreports.updateOne(
    {    _id: "D123478JO",
        "reports.date": date, 
       "reports.patients.id": "BM382487"
    },
    { $set: { "reports.$[report].patients.$[patient].status": "complete" } },
    {
      arrayFilters: [
        { "report.date": "2025-03-17" },
        { "patient.id": "BM382487" }
      ]
    }
  )

  
  