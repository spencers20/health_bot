const symptominput=document.getElementById('symptominput')
const checksymptom =document.querySelector('.checksymptom')
const symptomconfirm =document.querySelector('.symptomconfirm')
const checkbtn=document.getElementById('checkbtn')
const conditions=document.querySelector('.conditions')
const moreinfo=document.getElementById('moreinfo')
const condition=document.getElementById('condition')
const symptom=document.getElementById('symptoms')
const checkedsymptoms=document.getElementById('checkedsymptoms')
const moreinformation=document.querySelector('.moreinformation')
const managesymptomtittle=document.getElementById('managesymptomtittle')
const relatdconditions=document.getElementById('relatdconditions')

console.log(symptominput.value)

let addedsymptoms=[];
let chatId;

symptominput.addEventListener('keydown' ,async( event)=>{
    console.log(event.key)
    if(event.key==='Enter'){
        console.log('enter key pressed')
        event.preventDefault()

        if(symptominput.value){
            addedsymptoms.push(symptominput.value.trim()) //add any symptom added by the user into the array
            // addedsymptoms=symptominput.value
            checkbtn.style.visibility='visible'
            const addsymptoms=document.createElement('div')
            addsymptoms.classList.add('symptms')
            addsymptoms.textContent=symptominput.value
            symptomconfirm.insertBefore(addsymptoms,checkbtn)
            

        }else{
            console.log('no symptoms')

        }
        // console.log(addsymptoms.textContent)

        symptominput.value=''



    }

})

checkbtn.addEventListener('click',async()=>{
    console.log ('checkbtn clicked')
    console.log (addedsymptoms) 
    const messages=addedsymptoms.join(', ')
    const results=document.createElement('div')
    results.classList.add('results')
    results.textContent=''
   
    const response=await fetch('/ask',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({message:messages})
    })

    const result=await response.json()
    console.log(result)

    results.textContent=result.text
    chatId=result.chatId
    // conditions.appendChild(results)
    conditions.insertBefore(results,managesymptomtittle.nextSibling)
    moreinfo.style.visibility='visible'


})

const symptominput2=document.getElementById('symptominput2')

moreinfo.addEventListener('click',async()=>{
    moreinfo.style.visibility='hidden'
    checkbtn.style.visibility='hidden'
    
    
    console.log('moreinfo clicked')
    symptom.style.visibility='hidden'
    condition.style.visibility='visible'
    const messages=addedsymptoms.join(',')
    const aboutsymptom=document.createElement('div')
    aboutsymptom.classList.add('aboutsymptom')

    checkedsymptoms.textContent='SYMPTOMS: '+ messages

    const response=await fetch('/ask',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({message:messages})
    })

    const results=await response.json()
    console.log(results)

    
    aboutsymptom.textContent=results.text
    moreinformation.appendChild(aboutsymptom)

    relatdconditions.style.visibility='visible' 
        
    

    





    
})
