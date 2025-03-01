// const e = require("express")


const input=document.getElementById('question')
const btn=document.getElementById('btn')
const container = document.querySelector('.container')
const question = document.getElementById('question')
const btn2=document.getElementById('btn2')
const intro=document.getElementById('intro')
const chatContainer=document.getElementById('chat-container')
const newchat=document.querySelector('.new-chat')
const sidebar=document.querySelector('.side-bar')
const editsvg=document.querySelectorAll('.edit-svg')
const thevalue=document.getElementById('tempvalue')
const conditiondegree=document.getElementById('conditiondegree')
const valueinputt=document.querySelectorAll('.value-input')
const eventathome=document.getElementById('eventhome-date')
const eventhomesummary=document.getElementById('eventhome-summary')
const popgraph=document.getElementById('popgraph').getContext("2d")
const cardmetric=document.querySelectorAll('.metric-middle')
const popup=document.getElementById('popup')
const inputvalues=document.querySelectorAll('.inputvalues')
const backsvg=document.querySelectorAll('.back-svg')


function formatTextToHTML(text) {
    return text
      .replace(/\n/g, '<br>') // Convert newlines to <br>
      .replace(/\* (.+?)(\n|$)/g, '<li>$1</li>') // Convert * bullet points to <li>
      .replace(/(?:<li>.+?<\/li>)+/g, '<ul>$&</ul>'); // Wrap <li> in <ul>
  }

async function gettips(){
    try{
        const alltips=await fetch('/tips')
        const tips= await alltips.json()
        const randomtip=tips[Math.floor(Math.random()*tips.length)]
        console.log('random picked tip..',randomtip)
        const tipdescription=document.querySelector('.tip-description')

        
        tipdescription.textContent=randomtip.description
       

        tipimage=document.querySelector('.tip-image')
     
        tipimage.setAttribute('src',randomtip.image)
      


    }catch(e){
        console.error('error in getting and displaying tips...',e)
    }
    
}

Array.from(editsvg).forEach((edit)=>{
    edit.addEventListener('click',(e)=>{
        try{
            console.log('svg clicked')
            const card =e.target.closest('.card-metric')
    
            const metricmiddle=card.querySelector('.metric-middle')
            const thevalue=card.querySelector('#tempvalue')
            const conditiondegree=card.querySelector('#conditiondegree')
            const inputvalues=card.querySelector('.inputvalues')
            const editvalue=card.querySelector('.edit-value')
            const cardinput=card.querySelector('.value-input')
            const backsvg=editvalue.querySelector('.back-svg')
            backsvg.style.opacity=1
           
    
            if (thevalue && conditiondegree && metricmiddle && cardinput && inputvalues ){
                
                inputvalues.style.display='flex'
                // backsvg.style.opacity=1
                cardinput.innerHTML=''
                metricmiddle.style.display='none '
 
            } 
       

        }catch(e){
            console.log('error in editing value,...',e)
        }
    })

}) 

Array.from(backsvg).forEach(svg=>{
    svg.addEventListener('click',(e)=>{
        const card=e.target.closest('.card-metric')
        const middlemetric=card.querySelector('.metric-middle')
        const inputvalues=card.querySelector('.inputvalues')
        const editvalue=card.querySelector('.edit-value')
        const backsvg=editvalue.querySelector('.back-svg')
        backsvg.style.opacity=1
    
        if (middlemetric && inputvalues){
            middlemetric.style.display="flex"
            inputvalues.style.display='none'
            svg.style.opacity=0
            
        }
    })
})

async function insertvalue(metric,value){
    try{

        const metricvalues={
            "metrics":metric,
            "values":value
        }
        const results=await fetch('/user/insertmetric',{
            method:'POST',
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({metricvalues})
        })
        console.log('results...,',results)
        return results
    }catch(e){
        console.log('error in pushing values to backend...',e)
    }
    

}

Array.from(valueinputt).forEach(valueinput=>{
    valueinput.addEventListener('keydown',async (e)=>{
     try{

         if (e.key==='Enter'){
            console.log('Enter key pressed')
            const card=e.target.closest('.card-metric')
            
            const metricmiddle=card.querySelector('.metric-middle')
            const inputvalues=card.querySelector('.inputvalues')
            const value=metricmiddle.querySelector('#tempvalue')
            const conditiondegree=metricmiddle.querySelector('#conditiondegree')
            const editvalue=card.querySelector('.edit-value')
            const backsvg=editvalue.querySelector('.back-svg')
            backsvg.style.opacity=0
             
             const valueentered=valueinput.value
             console.log('valueentered...',valueentered)

            if (inputvalues && metricmiddle && value && conditiondegree){
                console.log('they all exist')
                console.log('metric-middle')
                const cardId=metricmiddle.getAttribute('card-id')
                inputvalues.style.display='none'
                metricmiddle.style.display='flex'
                metricmiddle.style.flexDirection='column'
                const inputid=inputvalues.getAttribute('input-id')
                const sysinput=inputvalues.querySelector('.sysvalueinput')

                if (cardId==='temperature'){
                    const metric="temperature"
                    await insertvalue(metric,Number(valueentered))

                    if(valueentered >38 || valueentered<36 ){
                        conditiondegree.innerHTML='alarming',
                        conditiondegree.style.color='red'
                    }  else{
                        conditiondegree.innerHTML='normal'
                        conditiondegree.style.color='black'

                    }

                    value.innerHTML=valueentered + '&deg;c'
                } else if (cardId==='pressure'){
                  const sysvalue=sysinput.value
                  if(sysvalue==''){
                      alert('enter the systolic value')
                      inputvalues.style.display='flex'
                      metricmiddle.style.display='none'
                  }

                  if(sysvalue>120 && valueentered >80){
                        conditiondegree.innerHTML='alarming',
                        conditiondegree.style.color='red'
                    }  else{
                        conditiondegree.innerHTML='normal'
                        conditiondegree.style.color='black'

                    }

                    const metric="bloodPressure"
                    const pvalues={
                        systolic:Number(sysvalue),
                        diastolic:Number(valueentered)
                    }
                    await insertvalue(metric,pvalues)
                
                 value.innerHTML=`${sysvalue}/${valueentered} mmHg`
                } else   if (cardId==='pulse'){
                    const metric="pulseRate"
                    await insertvalue(metric,Number(valueentered))

                    if(valueentered >100 || valueentered<60 ){
                        conditiondegree.innerHTML='alarming',
                        conditiondegree.style.color='red'
                    }  else{
                        conditiondegree.innerHTML='normal'
                        conditiondegree.style.color='black'

                    }

                    value.innerHTML=`${valueentered} bpm` 
                
            } else{
                const metric="respiratoryRate"
                await insertvalue(metric,Number(valueentered))

                if(valueentered >24 || valueentered<10 ){
                    conditiondegree.innerHTML='alarming',
                    conditiondegree.style.color='red'
                }  else{
                    conditiondegree.innerHTML='normal'
                    conditiondegree.style.color='black'

                }

                value.innerHTML=`${valueentered} bpm` 
            }
             
          
     
         }
     }}catch(e){
        console.log('errror in adding valueinput card...',e)
     }
})
})

async function getevents(){
    try{
       const response =await fetch('/user/allevents')
       const event=await response.json()
       console.log('events loaded')
    //    console.log(`events ${Object.values(events.events)}`)
       Array.isArray(event.events)?console.log("events is an array"):console.log('events is not an array')
       const events=event.events.sort((a,b)=>new Date(b.datedue)-new Date(a.datedue))
       return events
      
    } catch(e){
        console.error(`Error getting the events ${e}`)
    }

}


let currentchart=null

async function bpressurechart(data){
    try{
        const datelabels=Object.keys(data)
        const systolic=datelabels.map(date=>data[date].systolic)
        const diastolic=datelabels.map(date=>data[date].diastolic)

        if (currentchart){
            currentchart.destroy()
        }

        currentchart=new Chart(popgraph,{
            type:'line',
            data:{
                labels:datelabels,
                datasets:[{
                    label:'systolic Pressure',
                    data:systolic,
                    borderColor:'red',
                    tension:0.4
                },
                {
                    label:'diastolic Pressure',
                    data:diastolic,
                    borderColor:'blue',
                    tension:0.4
                }
            ]

            },
            options:{
                respoonsive:true,
                maintainAspectRatio:false
            }

        })

    }catch(e){
        console.log('error in making the bloodpressure chart...',e)
    }
}

async function displaychart(data,label ,color){
    try{
        
        const labels=Object.keys(data)
        const values=Object.values(data)

        if (currentchart){
            currentchart.destroy()
        }

        currentchart=new Chart(popgraph,{
            type:'line',
            data:{
                labels:labels,
                datasets:[{
                    label:label,
                    data:values,
                    borderColor:color,
                    tension:0.4
                    
                }]
            },
            options:{
                responsive:true ,
                maintainAspectRatio: false 
            }
    
        })

      
    }catch(e){
        console.error('error in drawing the chart ..',e)
    }
}

window.addEventListener('click',(e)=>{
    if(e.target===popup){
        popup.style.display='none'
    } else if(e.target===cardmetric){
        cardmetric.style.display='flex'
    }

})

Array.from(cardmetric).forEach(card=> card.addEventListener('click',async ()=>{
    try{
        const results=await fetch('/user/getmetrics')
        const metricstrend=await results.json()
        console.log('clicked card...')
        const datakey=card.getAttribute('card-id')
        // const data=window[datakey]
        popup.style.display='flex'
        console.log('metricstrend..',metricstrend)
       
        // const label=datakey
        if (datakey==='temperature'){
            const temperature=Object.fromEntries(metricstrend.temperature.map(entry=>[entry.date,entry.value]))
            color='rgba(255, 99, 132, 1)'
            await displaychart(temperature,datakey,color)
            console.log('datakey...',datakey)
        } else if(datakey==='pulse'){
            const pulseRate=Object.fromEntries(metricstrend.pulseRate.map(entry=>[entry.date,entry.value]))
            color='rgb(130, 255, 99)'
            await displaychart(pulseRate,datakey,color)
            console.log('datakey...',datakey)
        } else if(datakey==='respiratory'){
            const respiratoryRate=Object.fromEntries(metricstrend.respiratoryRate.map(entry=>[entry.date,entry.value]))
            color='rgb(0, 206, 209)'
            await displaychart(respiratoryRate,datakey,color)
            console.log('datakey...',datakey)
        }else{
            const bloodPressure=Object.fromEntries(metricstrend.bloodPressure.map(entry=>[entry.date,entry.value]))
            console.log('bloodpressure...',bloodPressure)
            console.log('datakey...',datakey)
            await bpressurechart(bloodPressure)
 
        }
    }catch(e){
        console.log('error in cardmetric click...',e)
    }


})
)

document.addEventListener('DOMContentLoaded',async()=>{
  
    
    const tips=await gettips()
    setInterval(tips,10000);
    const events=await getevents()
    const datetoday=new Date()
    const upcomingevent=events.reverse().find(event=>new Date(event.datedue)>=datetoday)
    console.log('upcomingevent...',upcomingevent)
    const upcomingdateformat=new Date(upcomingevent.datedue).toLocaleString('en-US',{
        year:'numeric',
        month:'long',
        day:'numeric',
        weekday:'long',
        hour:'numeric',
        minute:'numeric',
        hour12:true
    })
    console.log('upcoming date format,...',upcomingdateformat)
    console.log('upcomingevent.datedue...', typeof upcomingevent.datedue)
    eventathome.textContent=upcomingdateformat
    eventhomesummary.textContent=upcomingevent.summary


})
















