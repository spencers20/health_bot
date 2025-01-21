use('logs')
db.history.aggregate([
    {
        $match: {
            _id: "100984849132378172203",
            "histories.status": "starred"
        }
    },
    {
        $project: {
            histories: {
                $filter: {
                    input: "$histories",
                    as: "history",
                    cond: { $eq: ["$$history.status", "starred"] }
                }
            }
        }
    },
    {
        $unwind: "$histories"
    },
    {
        $sort: {
            "histories.date": -1
        }
    },
    {
        $group: {
            _id: "$_id",
            histories: {
                $push: {
                    date: "$histories.date",
                    title: "$histories.title", // Corrected from `tittle`
                    description: "$histories.description",
                    summary: "$histories.summary"
                }
            }
        }
    }
]);

// db.history.find({
//     _id:"100984849132378172203"
// })