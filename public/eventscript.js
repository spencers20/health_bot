
const eventdate=document.getElementById('eventdate')
const ctx=document.getElementById('mainchart').getContext("2d")
const calendarEl=document.getElementById('calendar')
const plugins=Chart.plugins
const genreminder=document.getElementById('genreminder')
const reminder=document.getElementById('reminder')
const responsecontainer=document.getElementById('responsecontainer')
const responsearea=document.getElementById('responsearea')
const setreminder=document.getElementById('setreminder')
const setremwithdate=document.getElementById('setremwithdate')
const setdate=document.getElementById("setdate")
const saveevent=document.getElementById('saveevent')
const settitle=document.getElementById('settitle')
const setremwithai=document.getElementById('setremwithai')
const setdescription=document.getElementById('setdescription')
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



async function eventschart(events){
    try{

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
        document.getElementById("upcomingcount").innerHTML=events.upcoming
        document.getElementById("cancelledcount").innerHTML=events.cancelled
        document.getElementById("Completedcount").innerHTML=events.completed
        document.getElementById("uncompletedcount").innerHTML=events.uncompleted
    } catch(e){
        console.error('error in building a chart ',e)
    }
}


let duesetdate
const calendar=new FullCalendar.Calendar(calendarEl,{
      
    initialView:'dayGridMonth',
    selectable:true,
    dateClick:(info)=>{
         duesetdate=info.dateStr
        try{
            setremwithai.style.display='none'
            setremwithdate.style.display='flex'
            setdate.innerHTML=info.dateStr
            alert("selected date :" +info.dateStr   )
        } catch(e){
            console.error('errror in date ',e)
        }
    },
    height:'auto',
    headerToolbar: {
        left: 'prev,next',
        center: 'title',  // This controls the title placement
        right: ''
      },
  
})

    calendar.render()

saveevent.addEventListener('click',async()=>{
    try{

        const date=new Date()
        const dateset=new Date(duesetdate)

        const reminderdetails={
            "type":"upcoming",
            "description":setdescription.value,
            "summary":settitle.value,
            "datedue": dateset,
            "dateset":date,
            "status":"upcoming"

        }

        const rems=[reminderdetails]
        console.log('reminderdetails',rems)
        console.log('reminderdetails is an array ',Array.isArray(reminderdetails))
        const reminder=reminderdetails
        await fetch('/user/storeevent',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({reminder})
        }).then(response=>{
            console.log('response ', response)
            response.ok? alert('reminder stored'):console.error('not stored in db')
        })
    } catch(e){
        console.log('error in saving event ',e)
    }


})

async function getevents(){
    try{
       const response =await fetch('/user/allevents')
       const event=await response.json()
    //    console.log(`events ${Object.values(events.events)}`)
       Array.isArray(event.events)?console.log("events is an array"):console.log('events is not an array')
       const events=event.events.sort((a,b)=>new Date(b.datedue)-new Date(a.datedue))
       return events
      
    } catch(e){
        console.error(`Error getting the events ${e}`)
    }

}

function eventlist(events){ 
    try{
        // console.log("events...",events)
        // const sortedeventlist=events.events.sort((a,b)=>new Date(b.datedue)-new Date(a.datedue))
    //    console.log("sortedeventlist...",sortedeventlist)
      //  console.log("eventlist function entered....")
      const elist=document.querySelector('.elist')
    //   elist.classList.add('eventslist')
      elist.innerHTML=''
      const listcontainer=document.createElement('div')
      listcontainer.innerHTML=""
      elist.appendChild(listcontainer)

      const sortedeventlist=events
        sortedeventlist.forEach((event)=>{
            const onevent=document.createElement('div')
            onevent.style.borderBottom='1px solid black'
            onevent.classList.add('eventone')

            const menus=document.createElement('div')
            menus.style.display='flex'
            menus.style.flexDirection='row'
            const menudots = document.createElement('div');
            menudots.style.cursor='pointer'
            menudots.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="24px" height="24px" viewBox="0 0 64 64">
                    <circle cx="32.026" cy="12.028" r="4"/>
                    <circle cx="32.026" cy="32.028" r="4"/>
                    <circle cx="32.026" cy="52.028" r="4"/>
                </svg>
            `;
            menudots.setAttribute('details.duedate',event.datedue)
            menudots.setAttribute('details.description',event.description)
            console.log("duedate...",event.datedue)
            menus.appendChild(menudots);

            const menulist=document.createElement('div')
            menulist.classList.add('menulist')
            menulist.innerHTML=`
                <span   class="popuplist completevent"> completed </span>
                <span   class="popuplist cancelevent"> cancel</span>
                <span   class="popuplist activatevent" style="display:none; align-items:center" > activate</span>
                <span   class="popuplist deletevent">delete</span>
            
            `
            menus.appendChild(menulist)

            

            function togglemenulist(){
                if(menulist.style.display=='none' || menulist.style.display==''){
                    menulist.style.display='flex'
                    eventdate.style.marginLeft='100px'
                } else{
                    menulist.style.display='none'
                    eventdate.style.marginLeft='150px'
                
            }
        } 
                               
          const activatevent=menulist.querySelector('.activatevent')
          const cancelevent=menulist.querySelector('.cancelevent')
          const completevent = menulist.querySelector('.completevent');
        
            menudots.addEventListener('click',()=>{
                const duedate=menudots.getAttribute('details.duedate')
                if (event.status=='cancelled'){
                    cancelevent.style.display='none'
                    activatevent.style.display='flex'
                    completevent.style.display='none'

                }
                console.log("duedate...",duedate)
                togglemenulist()
                
            })
             
            //menulist functions
            async function menulistlistener(task){
                try{
                    const completedate=menudots.getAttribute('details.duedate')
                const description=menudots.getAttribute('details.description')
                const message={
                    description:description,
                    date:completedate,
                    task:task
                }
                await fetch('/user/manageevent',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify(message)
                }) .then(async (response)=>{
                    const results=await response.json()
    
                    if(results.modifiedCount>0){
                        const eventlist=await allfunctions()
                        // await upcomingreminders()
                        await eventschart(eventlist)
                        return results 
                    }
                }
                )
                }catch(e){
                    console.error('errror adding eventlistener to menus ',e)

                }
            }


            
            completevent.addEventListener('click', async(e) => {
                try{
                    console.log('Complete event clicked!');
                    e.target.style.color = 'red';
                    task='complete'
                    const results=await menulistlistener(task) 
                    if (results.modifiedCount>0){
                        alert('event completed successfully')
                    }
                }catch(e){
                    console.error('error in completing an event ',e)
                }
                
            });


            const deleteevent=menulist.querySelector('.deletevent')
            deleteevent.addEventListener('click',async(e)=>{
                try{
                    console.log('Delete event clicked!');
                    e.target.style.color = 'red';
                    task='delete'
                    const results=await menulistlistener(task) 
                    if (results.modifiedCount>0){
                        alert('event deleted successfully')
                    }
                }catch(e){
                    console.error('error in deleting an event ',e)
                }

            })

            
            cancelevent.addEventListener('click',async(e)=>{
                try{
                    console.log('cancel event clicked!');
                    e.target.style.color = 'red';
                    task='cancel'
                    const results=await menulistlistener(task) 
                    if (results.modifiedCount>0){
                        alert('event canceled successfully')
                    }
                }catch(e){
                    console.error('error in canceling an event ',e)
                }
                             

            })

            activatevent.addEventListener('click', async(e)=>{
                try{
                    console.log('activate event clicked!');
                    e.target.style.color = 'red';
                    task='activate'
                    const results=await menulistlistener(task) 
                    if (results.modifiedCount>0){
                        alert('event activated successfully')
                    }
                }catch(e){
                    console.error('error in canceling an event ',e)
                }

            })


            onevent.appendChild(menus)
            

           
            const eventdetails=document.createElement('div')
            eventdetails.style.flexDirection='column'
            eventdetails.style.marginLeft='10px'
            const eventdate=document.createElement('div')
            eventdate.style.marginBottom='10px'
            eventdate.style.marginLeft='150px'
            if (event.status=='upcoming'){
                 eventdate.style.color='blue'
            } else if(event.status=='cancelled'){
                eventdate.style.color='red'
            }else if(event.status=='completed'){
                eventdate.style.color='green'
            } else{
                eventdate.style.color='rgb(255, 230, 224)'
            }
           
            const date=new Date(event.datedue)
            const finaldate=date.toLocaleDateString('en-US',{
                weekday:'short',
                day:'numeric',
                month:'numeric',
                year:'2-digit'

            })
            eventdate.innerHTML=finaldate
            eventdetails.appendChild(eventdate)
    
            const eventdisc=document.createElement('div')
            eventdisc.style.marginBottom='10px'
            eventdisc.innerHTML=event.summary
            eventdetails.appendChild(eventdisc)
            onevent.appendChild(eventdetails)

            listcontainer.appendChild(onevent)
            elist.appendChild(onevent)
    
        })
    }catch(e){
        console.error('error in appending events ',e)
    }
    

}

function todayevents(events){
    try{
        const date=new Date().toLocaleDateString('en-CA')
        console.log('date today..',date)
        events.forEach((event)=>{
            const formatteddate= new Date(event.datedue).toLocaleDateString('en-CA')
            console.log('date formaatted',formatteddate)
            if (formatteddate==date){
                 console.log("event....",event)
                document.getElementById('eventtittle').innerHTML=event.type
                document.getElementById('event').innerHTML=event.summary
                 
            }

        })

    }catch(e){
        console.error('error in getting today events ',e)
    }
}

//function to generate result from the AI model
genreminder.addEventListener('click',async()=>{
    try{
        const rem=reminder.value
        console.log('reminder',rem)
        const response = await fetch('/ask', {
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
        await fetch('/user/storeevent',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },  
            body:JSON.stringify({reminder})
        }).then(response=>{
            response.ok? alert('reminder created successfully'):console.log('reminder not set')
        })
    }catch(e){
        console.error('error in setting reminder...',e)
    }

})


async function upcomingreminders(){
    const events=await getevents()
    let upcomingevents=[]
    events.forEach((event)=>{
        if (event.status=='upcoming'){
            upcomingevents.push(event)
        }

    })

    return upcomingevents

}

async function cancelledreminders(){
    const events=await getevents()
    let cancelledevents=[]
    events.forEach((event)=>{
        if (event.status=='cancelled'){
            cancelledevents.push(event)
        }

    })

    return cancelledevents

}

async function completedreminders(){
    const events=await getevents()
    let completedevents=[]
    events.forEach((event)=>{
        if (event.status=='completed'){
            completedevents.push(event)
        }

    })
    console.log("completedevents is an array..." ,Array.isArray(completedevents))
    const sortedevents=completedevents.sort((a,b)=>new Date(b.duedate)-new Date(a.duedate))
    console.log('sortedevents...',sortedevents)
    console.log('completedevents...',completedevents)
    return completedevents


}

async function uncompletedreminders(){
    const events=await getevents()
    let uncompletedevents=[]
    events.forEach((event)=>{
        if (event.status=='uncompleted'){
            uncompletedevents.push(event)
        }

    })
    return uncompletedevents

}

document.getElementById("cancellegend").addEventListener('click',async()=>{
    
    const events= await cancelledreminders()
    console.log("cancelled events",events)
    eventlist(events)
    document.querySelector('.bot-box').scrollIntoView({behavior:"smooth"})
    document.getElementById('event_type').innerHTML="Cancelled Events"
})


document.getElementById('completedlegend').addEventListener('click',async()=>{
    const events=await completedreminders()
    eventlist(events)
    document.querySelector('.bot-box').scrollIntoView({behavior:"smooth"})
    document.getElementById('event_type').innerHTML="Completed Events"
})

document.getElementById('upcominglegend').addEventListener('click',async()=>{
    const events=await upcomingreminders()
    eventlist(events)
    document.querySelector('.bot-box').scrollIntoView({behavior:"smooth"})
    document.getElementById('event_type').innerHTML="Upcoming Events"
})

document.getElementById('uncompletedlegend').addEventListener('click',async()=>{
    const events=await uncompletedreminders()
    eventlist(events)
    document.querySelector('.bot-box').scrollIntoView({behavior:"smooth"})
    document.getElementById('event_type').innerHTML="Uncompleted Events"
})

async function allfunctions(){
    const events= await getevents()
     eventlist(events)
     todayevents(events)
    
     const upcoming=await upcomingreminders()
     const uncompleted=await uncompletedreminders()
     const cancelled=await cancelledreminders()
     const completed=await completedreminders()
    
     const eventsdist={
         "cancelled":cancelled.length,
         "upcoming":upcoming.length,
         "completed":completed.length,
         "uncompleted":uncompleted.length
     }
    
     await eventschart(eventsdist)

     return eventsdist
}

document.addEventListener('DOMContentLoaded',allfunctions)