const symptominput=document.getElementById('symptominput')
const checksymptom =document.querySelector('.checksymptom')
const symptomconfirm =document.querySelector('.symptomconfirm')
const checkbtn=document.getElementById('checkbtn')
const conditions=document.querySelector('.conditions')

console.log(symptominput.value)

let addedsymptoms;

symptominput.addEventListener('keydown' ,async( event)=>{
    console.log(event.key)
    if(event.key==='Enter'){
        console.log('enter key pressed')
        event.preventDefault()

        if(symptominput.value){
            // addedsymptoms.push(symptominput.value.trim()) //add any symptom added by the user into the array
            addedsymptoms=symptominput.value
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
   
    const response=await fetch('/ask',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({message:addedsymptoms})
    })

    const result=await response.json()
    console.log(result)

    const results=document.createElement('div')
    results.classList.add('results')
    results.textContent=result.text
    conditions.appendChild(results)


})
