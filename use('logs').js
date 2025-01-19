use('logs')
const date=ISODate("2025-01-16T13:11:52.641Z")
console.log(date)
db.history.find({
    _id:"100984849132378172203",
    "histories.date":date
},
{
    "histories":{$elemMatch:{date:date}}
}
)