use('logs')
db.history.aggregate([
    {
        $match:{
            _id:"100984849132378172203",
            "histories.status":"starred",
            "histories":{$elemMatch:{status:"starred"}}
        }
    },
    {
        $unwind:"$histories"
    },
    {
        $sort:{
            "histories.date":-1
        }
    },
    {
        $group:{
            _id:"100984849132378172203",
            histories:{
                $push:{
                    date:"$histories.date",
                    tittle:"$histories.tittle",
                    description:"$histories.description",
                    summary:"$histories.summary"
                }
            }
        }
    }
])


// db.history.find({
//     _id:"100984849132378172203"
// })

// db.history.updateOne(
//     { _id: "100984849132378172203" },
//     {
//         $set: {
//             histories: [
//                 {
//                     date: new Date("2025-01-15"), // Date for 'The Uneasy Stomach'
//                     tittle: "The Uneasy Stomach",
//                     description: "I feel a wave of discomfort rising from my stomach, leaving me queasy and unsettled. The constant urge to vomit makes it hard to focus or enjoy eating.",
//                     summary: "I experience persistent stomach unease and an urge to vomit, disrupting my normal activities."
//                 },
//                 {
//                     date: new Date("2025-01-16"), // Date for 'The Heavy Crown'
//                     tittle: "The Heavy Crown",
//                     description: "There’s a throbbing or sharp pain in my head that makes every sound and movement unbearable. I struggle to concentrate as the pain refuses to let up.",
//                     summary: "I feel persistent head pain that makes it hard to focus and sensitive to sound and motion."
//                 },
//                 {
//                     date: new Date("2025-01-17"), // Date for 'The Phantom Ring'
//                     tittle: "The Phantom Ring",
//                     description: "There’s a faint but constant ringing or buzzing in my ears, even when it’s completely silent. It’s frustrating and makes it hard for me to focus on anything else.",
//                     summary: "I hear a constant buzzing in my ears that leaves me feeling distracted and irritated."
//                 },
//                 {
//                     date: new Date("2025-01-18"), // Date for 'The Strained Vision'
//                     tittle: "The Strained Vision",
//                     description: "My eyes ache with a dull, persistent pain that gets worse when I look at screens or bright lights. Even after resting, it feels like my eyes are still tired and strained.",
//                     summary: "My eyes hurt and feel strained, especially when exposed to light or screens."
//                 }
//             ]
//         }
//     }
// );
