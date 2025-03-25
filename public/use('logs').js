use('logs')
const randomnumber=Math.floor(Math.random()*1e10).toString()
const n=randomnumber.slice(0,6)
console.log('number...',n)
const id='MB'+n

const user=db.users.findOne({
    googleId:"109501795520629194446"
})

const newuser={...user,_id:id}

db.users.insertOne(newuser)
db.users.deleteOne(
    {
        googleId:"109501795520629194446"
    })

db.users.find()

