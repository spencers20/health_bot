
const symptominput=document.getElementById('symptominput')
const checksymptom =document.querySelector('.checksymptom')
const symptomconfirm =document.querySelector('.symptomconfirm')
const checkbtn=document.getElementById('checkbtn')
const conditions=document.querySelector('.conditions')
const moreinfo=document.getElementById('moreinfo')
const condition=document.getElementById('condition')
const symptom=document.querySelector('.symptoms')
const checkedsymptoms=document.getElementById('checkedsymptoms')
const moreinformation=document.querySelector('.moreinformation')
const managesymptomtittle=document.getElementById('managesymptomtittle')
const relatdconditions=document.getElementById('relatdconditions')
const continu=document.getElementById('continue')
const male=document.getElementById('male')
const female=document.getElementById('female')
const age=document.getElementById('age')
const buttons=document.getElementById('buttons')
const tip=document.getElementById('tip')
const headertip=document.getElementById('headertip')


console.log(symptominput.value)
console.log(age.value)

let userinfo=[];
let usersinfocontainer;

let addedsymptoms=[];
let chatId;



function formatTextToHTML(text) {
    return text
      .replace(/\n/g, '<br>') // Convert newlines to <br>
      .replace(/\* (.+?)(\n|$)/g, '<li>$1</li>') // Convert * bullet points to <li>
      .replace(/(?:<li>.+?<\/li>)+/g, '<ul>$&</ul>'); // Wrap <li> in <ul>
  }

  function toggleDisclaimer() {
    const disclaimer = document.getElementById('disclaimer');
    if (disclaimer.style.display === 'none' || disclaimer.style.display === '') {
        disclaimer.style.display = 'block';
    } else {
        disclaimer.style.display = 'none';
    }
}
  async function gettips(){
    try{

        const response =await fetch('/tips')
        const results = await response.json()
    
        const randomtip=results[Math.floor(Math.random()*results.length)]
     
        headertip.textContent=randomtip.title
        tip.textContent=randomtip.description

    }catch(e){
        console.error(`error in getting tips from api : ${e}`)
    }
}



male.addEventListener('click',async()=>{
    if (age.value){
        userinfo={
            age:age.value,
            gender:'Male'    
        }
        }
        else{
            userinfo={
                gender:'Male'}
        }
        console.log(userinfo)
})

female.addEventListener('click',async()=>{
    if (age.value){
    userinfo={
        age:age.value,
        gender:'female'    
    }
    }
    else{
        userinfo={
            gender:'female'}
    }
    console.log(userinfo)
})

continu.addEventListener('click',async()=>{
    console.log('clicked')
    //  userinfo.push(age.value)
    
    console.log(userinfo)
    symptom.style.visibility='visible'
    document.querySelector('.information').style.visibility='hidden'
    await gettips()
    setInterval(gettips,10000)
    
    document.getElementById('userage').textContent=`Age :${userinfo.age}`
    document.getElementById('usergender').textContent=`Gender :${userinfo.gender}`

})

document.addEventListener('click',async()=>{
    const readmore=document.getElementById('readmore')
    if(!readmore){
    
    document.getElementById('disclaimer').style.display='none'
    // if(disclaimer.style.display=='block'){
    //     disclaimer.style.display='none'
    // }
}
})


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
            addsymptoms.classList.add('addsymptomss')
           

            const symptomtxt=document.createElement('span')
            symptomtxt.classList.add('symptms')
            symptomtxt.textContent=symptominput.value
            

            const clearIcon=document.querySelector('.clear-icon').cloneNode(true) //clone it for reuse
            
            clearIcon.style.display='block'
            clearIcon.style.cursor='pointer'
             
            clearIcon.addEventListener('click',()=>{
                addsymptoms.remove()
                const index=addedsymptoms.indexOf(symptominput.value.trim())

                if(index > -1){
                    addedsymptoms.splice(index,1)
                }
            })

            clearIcon.removeAttribute('class') //avoid duplications

            addsymptoms.appendChild(symptomtxt)
            addsymptoms.appendChild(clearIcon)

    
            symptomconfirm.style.display='block'
            symptomconfirm.appendChild(addsymptoms)
            // symptomconfirm.insertBefore(addsymptoms,buttons)
            

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
    document.getElementById('loading').textContent='Checking in progress...'
    const messages=addedsymptoms.join(', ')
    const results=document.createElement('div')
    results.classList.add('results')
    results.textContent=''
   
    const response=await fetch('/user/chat',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({message:messages})
    })

    const result=await response.json()
    text=' MANAGING YOUR SYMPTOMS <br> <br>'+result.text
    
    console.log(result)
    chatId=result.chatId
    if( response.ok){
        document.getElementById('userinformation').style.display='none'
        const formattedText = formatTextToHTML(text);
   
        results.innerHTML = formattedText;
        conditions.appendChild(results)
    
        moreinfo.style.visibility='visible'

    }

    document.addEventListener('scroll', function (e) {
        if (window.scrollY <= 0) {
            window.scrollTo(0, 0); // Prevent scrolling above the top
        }
    });
    

    


})


moreinfo.addEventListener('click',async()=>{
    moreinfo.style.visibility='hidden'
    checkbtn.style.visibility='hidden'
    document.getElementById('loadinginfo').style.visibility="visible"
    const messages=addedsymptoms.join(',')
    
    
    console.log('moreinfo clicked')



    const response=await fetch('/user/chat',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({message:messages})
    })

    const results=await response.json()
    console.log(results)
    if( response.ok){
        symptom.style.visibility='hidden'
        condition.style.visibility='visible'
        
        const aboutsymptom=document.createElement('div')
        aboutsymptom.classList.add('aboutsymptom')
        checkedsymptoms.textContent='SYMPTOMS: '+ messages
        document.getElementById('loadinginfo').style.display='none'
        document.getElementById('userages').textContent=`Age :${userinfo.age}`
        document.getElementById('usergenders').textContent=`Gender :${userinfo.gender}`
        document.getElementById('yoursymptoms').textContent=`SYMPTOMS : ${messages}`

        const formattedText=formatTextToHTML(results.text)

    
        aboutsymptom.innerHTML=formattedText
        moreinformation.appendChild(aboutsymptom)
    
        relatdconditions.style.visibility='visible' 
            
    

    }

    
})




