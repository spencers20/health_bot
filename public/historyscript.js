const currentdate=document.getElementById('currentdate')

const date=new Date()
const options={ weekday:"short", day:"numeric",month :"numeric" ,year:"numeric"}
const formattedDate=date.toLocaleDateString("en-US",options)
currentdate.textContent=formattedDate