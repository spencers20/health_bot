// const { height } = require("pdfkit/js/page")

const eventdate=document.getElementById('eventdate')
const ctx=document.getElementById('mainchart').getContext("2d")
const calendarEl=document.getElementById('calendar')
const plugins=Chart.plugins
// const height

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





// document.addEventListener('DOMContentLoaded',()=>{
   
// })