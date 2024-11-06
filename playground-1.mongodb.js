use('logs');

// db.createCollection('users')

// db.users.insertMany([
//     {

//         "name":"John"
//     }
// ])

db.users.find()



// db.chat_histo.find()
// db.chat_histo.find(
//     {},
//     { "messages.type": 1, "messages.data.content": 1, "_id": 0 }
// )

// const chats=db.chat_histo.find({})
// console.log(chats)