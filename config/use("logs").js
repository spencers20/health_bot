use("logs")
const today=new Date().toISOString()
docId="D126041MA"
const savebooking = db.docappointments.updateOne(
    { _id: "D126041MA" },
    {
        $pull: {
            "appointmentdates.$[].patients": { $in: ["John Doe", "Jane Doe"] }
        }
    }
)
  
  console.log(savebooking);
  

// db.docappointments.aggregate([
//     { $match: { _id: docId } }, // Match using string _id
//     { $unwind: "$appointmentdates" }, // Unwind appointmentdates array
//     {
//         $match: {
//             "appointmentdates.date": { $gt: new Date} // Ensure today is a Date object
//         }
//     },
//     {
//         $project: {
//             _id: 0,
//             date: "$appointmentdates.date",
//             mysessions: "$appointmentdates.mysessions",
//             patients: "$appointmentdates.patients" // Include patients if it exists
//         }
//     }
// ]).toArray();


