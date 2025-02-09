// const { height } = require("pdfkit/js/page")

// const { response } = require("express")

const eventdate=document.getElementById('eventdate')
const ctx=document.getElementById('mainchart').getContext("2d")
const calendarEl=document.getElementById('calendar')
const plugins=Chart.plugins
const genreminder=document.getElementById('genreminder')
const reminder=document.getElementById('reminder')
const responsecontainer=document.getElementById('responsecontainer')
const responsearea=document.getElementById('responsearea')
const setreminder=document.getElementById('setreminder')
// const height
let reminderresult
let options
const date=new Date()
console.log('date')
options={
    weekday:'long',
    day:'numeric',
    month:'numeric',
    year:'numeric'
}

const finaldate=date.toLocaleDateString('en-US',options)
console.log(finaldate)
eventdate.textContent=finaldate

events={
    'cancelled':3,
    'upcoming':8,
    'completed':10,
    'uncompleted':5
}

labels=Object.keys(events)
values=Object.values(events)

new Chart(ctx,{
    type:'pie',
    data:{
        labels:labels,
        datasets:[{
            label:'Event',
            data:values ,
            backgroundColor:['rgb(194, 74, 98)','rgb(16, 150, 194)','rgb(150, 231, 103)','rgb(255, 230, 224)']
        }]
    },
    options:{
        responsive:true,
        plugins:{
            title: {
                display: true,
                text: 'Event Stats', // Your chart heading
                font: {
                    size: 15
                },
                padding: {
                    top: 1,
                    bottom: 5
                }
            },
            legend:false
        }
    }
})

const calendar=new FullCalendar.Calendar(calendarEl,{
      
    initialView:'dayGridMonth',
    selectable:true,
    dateClick:(info)=>{
        alert("selected date :" +info.dateStr   )
    },
    height:'auto',
    headerToolbar: {
        left: 'prev,next',
        center: 'title',  // This controls the title placement
        right: ''
      },
  
})

    calendar.render()



async function getevents(){
    try{
       const response =await fetch('/events')
       const events=await response.json()
       console.log(`events ${Object.values(events.events)}`)
       Array.isArray(events.events)?console.log("events is an array"):console.log('events is not an array')
       return events
      
    } catch(e){
        console.error(`Error getting the events ${e}`)
    }

}

function eventlist(events){
    try{

        events.events.forEach((event)=>{
            const elist=document.querySelector('.elist')
            const onevent=document.createElement('div')
            onevent.classList.add('eventslist')
          
            
            const eventdate=document.createElement('div')
            eventdate.style.marginBottom='10px'
            eventdate.style.marginLeft='200px'
            eventdate.style.color='red'
            const date=new Date(event.datedue)
            const finaldate=date.toLocaleDateString('en-US',{
                weekday:'short',
                day:'numeric',
                month:'numeric',
                year:'2-digit'

            })
            eventdate.innerHTML=finaldate
            onevent.appendChild(eventdate)
    
            const eventdisc=document.createElement('div')
            eventdisc.style.marginBottom='10px'
            eventdisc.innerHTML=event.description
            onevent.appendChild(eventdisc)

    
            elist.appendChild(onevent)
    
        })
    }catch(e){
        console.error('error in appending events ',e)
    }
    

}



genreminder.addEventListener('click',async()=>{
    try{
        const rem=reminder.value
        console.log('reminder',rem)
        const response = await fetch('/greminder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rem })
        });

        console.log('response', response)
        reminderresult= await response.json()
        console.log('reminderresult', reminderresult)
        genreminder.style.display='none'
        responsecontainer.style.display='flex'
        document.getElementById('e_tittle').innerHTML=reminderresult[0].summary
        document.getElementById('e_type').innerHTML=reminderresult[0].type
        document.getElementById('e_description').innerHTML=reminderresult[0].description
        document.getElementById('event_datedue').innerHTML=reminderresult[0].datedue
        document.getElementById('event_dateset').innerHTML=reminderresult[0].dateset 
        // return reminderresult
    }catch(e){
        console.error('error in generating reminder')
    }
    console.log('generate reminder clicked')

})

setreminder.addEventListener('click',async()=>{
    try{

        console.log('setreminder clicked')
        const reminder=reminderresult[0]
        console.log('reminderresults',reminder)
        await fetch('/storeevent',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({reminder})
        }).then(response=>{
            response.ok? alert('reminder created successdfully'):console.log('reminder not set')
        })
    }catch(e){
        console.error('error in setting reminder...',e)
    }

})



document.addEventListener('DOMContentLoaded',async()=>{
   const events= await getevents()
    eventlist(events)
   
})