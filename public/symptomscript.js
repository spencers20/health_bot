
const symptominput=document.getElementById('symptominput')
const checksymptom =document.querySelector('.checksymptom')
const symptomconfirm =document.querySelector('.symptomconfirm')
const checkbtn=document.getElementById('checkbtn')
const conditions=document.querySelector('.conditions')
const moreinfo=document.getElementById('moreinfo')
const condition=document.querySelector('.condition')
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
const image=document.getElementById('image')
const symptomtextarea=document.getElementById('symptom-textarea')

const conditionstart=document.querySelector('.conditionstart')
const chatarea=document.querySelector('.chat-area')
const subsuggestion=document.querySelectorAll('.sub-suggestion')



console.log(symptominput.value)


let userinfo=[];
let usersinfocontainer;

let addedsymptoms=[];
let chatId;




// function formatTextToHTML(text) {
//     return text
//       .replace(/\n/g, '<br>') // Convert newlines to <br>
//       .replace(/\* (.+?)(\n|$)/g, '<li>$1</li>') // Convert * bullet points to <li>
//       .replace(/(?:<li>.+?<\/li>)+/g, '<ul>$&</ul>'); // Wrap <li> in <ul>
//   }

function formatTextToHTML(text) {
    // Ensure the text is a string
    text = String(text);
  
    // Convert newlines to <br> tags
    let formattedText = text.replace(/\n/g, '<br>');
  
    // Convert bullet points starting with an asterisk (*) into <li> items.
    // This regex looks for "* " at the beginning of a line (or after a <br>)
    // followed by text until a <br> or end of string.
    formattedText = formattedText.replace(/(^|<br>)\*\s+(.*?)(?=<br>|$)/g, '$1<li>$2</li>');
  
    // Wrap consecutive <li> elements into a <ul>
    formattedText = formattedText.replace(/((?:<li>.*?<\/li>)+)/g, '<ul>$1</ul>');
  
    return formattedText;
  }
  
  

  function toggleDisclaimer() {
    const disclaimer = document.getElementById('disclaimer');
    if (disclaimer.style.display === 'none' || disclaimer.style.display === '') {
        disclaimer.style.display = 'block';
    } else {
        disclaimer.style.display = 'none';
    }
}
//   async function gettips(){
//     try{

//         const response =await fetch('/tips')
//         const results = await response.json()
        
//         const randomtip=results[Math.floor(Math.random()*results.length)]
//         console.log('random tips',randomtip)
//         console.log('math random',Math.random())
//         console.log("Math.floor(Math.random()*results.length)", Math.floor(Math.random()*results.length))
//         headertip.textContent=randomtip.tittle
//         tip.textContent=randomtip.description
//         image.setAttribute('src',randomtip.image)

//     }catch(e){
//         console.error(`error in getting tips from api : ${e}`)
//     }
// }


function thinkinanimation(genanime){

    genanime.innerHTML = `<span id="startthinking">Generating</span>
    <span class="dot">.</span>
    <span class="dot">.</span>
    <span class="dot">.</span>`;


const dots=document.querySelectorAll('.dot')
dots.forEach(dot=>{
dot.classList.add('fadedot')
})

}

async function chatalignment(){
    try{

    }catch(e){
        console.error('error in creating chat structure...',e)
    }
    const usermessage=document.createElement('div')
    usermessage.classList.add('user-message')
    usermessage.innerHTML=symptomtextarea.value
    chatbox.appendChild('usermessage')

    const response=await fetch('/askgroq',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({message:messages})
    })
    const text=response.json()
    const results=formatTextToHTML(text)
    const botmessage=document.createElement('div')
    botmessage.classList.add('bot-response')
    botmessage.innerHTML=results
    chatbox.appendChild('botmessage')
    
}

async function getresponse(symptomvalue){
    try{
        const chatbox=document.querySelector('.chat-box')
        conditionstart.style.display='none'
        chatarea.style.display='flex'
        console.log(symptomvalue)
        const usermessage=document.createElement('div')
        usermessage.classList.add('user-message')
        usermessage.innerHTML=symptomvalue
        chatbox.appendChild(usermessage)
        const messages=symptomvalue
        
        const botmessage1=document.createElement('div')
        botmessage1.classList.add('bot-response')
        botmessage1.innerHTML = `<span id="startthinking">Generating</span>
        <span class="dot">.</span>
        <span class="dot">.</span>
        <span class="dot">.</span>`;
        chatbox.appendChild(botmessage1)
        const dots=document.querySelectorAll('.dot')
        dots.forEach(dot=>{
         dot.classList.add('fadedot')
         })
        
        
        // const response=await fetch('/askgroq',{
        //     method:'POST',
        //     headers:{
        //         'Content-Type':'application/json'
        //     },
        //     body:JSON.stringify({message:messages})
        // })
        if(response){
            
        
            const text=response.json()
            const botmessage=document.createElement('div')
            botmessage.classList.add('bot-response')
           
            // const formatedtext=formatTextToHTML(text)
            setTimeout(()=>{
                botmessage1.style.display='none'
        
                botmessage.innerHTML='i wenr home the other day'
            },3000)
            chatbox.appendChild(botmessage)
        }
        
        
        
        
        // chatarea.appendChild(chatbox)
    }catch(e){
        console.error('error in generating response...',e)
    }
 
}

symptomtextarea.addEventListener('keydown',async(e)=>{
    try{
        if(e.key ==='Enter'){
            e.preventDefault()
            const symptomvalue=symptomtextarea.value
            await getresponse(symptomvalue)
        }

    }catch(e){
        console.error('error in creating chat structure...',e)
    }

})

document.querySelector('.chat-textarea').addEventListener('keydown',async(e)=>{
    try{
        if(e.key ==='Enter'){
            e.preventDefault()
            const chattextarea=document.querySelector('.chat-textarea')
            const symptomvalue=chattextarea.value
            await getresponse(symptomvalue)
        }

    }catch(e){
        console.error('error in creating chat structure...',e)
    }

})

Array.from(subsuggestion).forEach(subsuggest=>{
    subsuggest.addEventListener('click',async()=>{
        const symptomvalue=subsuggest.innerText
        await getresponse(symptomvalue)

    })
})



document.addEventListener('DOMContentLoaded',async()=>{
   
    await gettips()
    setInterval(gettips,10000)

})


document.getElementById('readmore').addEventListener('click',()=>{
    console.log('readmore clicked')
    toggleDisclaimer()
})




continu.addEventListener('click',async()=>{
    console.log('clicked')
    //  userinfo.push(age.value)
    
    console.log(userinfo)
    symptom.style.display='block'
    document.querySelector('.information').style.display='none'
    // await gettips()
    // setInterval(gettips,10000)
    
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
    const messages=addedsymptoms.join(', ')
    const results=document.createElement('div')
    results.classList.add('results')
    results.textContent=''
    const genanime=document.querySelector('.genanime')
    // thinkinanimation(results)
    genanime.innerHTML = `<span id="startthinking">Generating</span>
                       <span class="dot">.</span>
                       <span class="dot">.</span>
                       <span class="dot">.</span>`;


    const dots=document.querySelectorAll('.dot')
    dots.forEach(dot=>{
        dot.classList.add('fadedot')
    })
    
   
    const response=await fetch('/askgroq',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({message:messages})
    })
    

    const result=await response.json()
    text=' MANAGING YOUR SYMPTOMS <br> <br>'+result 

    if(results){
        setTimeout(()=>{
            genanime.style.display="none"  
            console.log(result)
            // chatId=result.chatId
            // if( response.ok){
                // document.getElementById('userinformation').style.display='none'
            const formattedText = formatTextToHTML(text);
           
            results.innerHTML = formattedText;
            conditions.appendChild(results)
            
            moreinfo.style.display='block'
    },2000)
    }
    

    // }

    document.addEventListener('scroll', function (e) {
        if (window.scrollY <= 0) {
            window.scrollTo(0, 0); // Prevent scrolling above the top
        }
    });
    

    


})


moreinfo.addEventListener('click',async()=>{
    moreinfo.style.visibility='hidden'
    checkbtn.style.visibility='hidden'
    const messages=addedsymptoms.join(',')
    
    
    console.log('moreinfo clicked')



    // const response=await fetch('/user/chat',{
    //     method:'POST',
    //     headers:{
    //         'Content-Type':'application/json'
    //     },
    //     body:JSON.stringify({message:messages})
    // })

    const results=await response.json()
    console.log(results)
    if( response.ok){
        symptom.style.display='none'
        condition.style.display='block'
        
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

const currentPage=document.querySelector('.information')
currentPage.classList.add('active')

function changepage(pageonview, direction='right'){
    const newPage=document.querySelector(`${pageonview}`)
    if(newPage==currentPage) return;
    
    if (direction==='right'){
        currentPage.classList.remove('active')
        currentPage.classList.add('off-left')
        
        newPage.classList.remove('off-left','off-right')
        newPage.classList.add('off-right')

        newPage.offsetWidth
        newPage.classList.remove('off-right')
        newPage.style.display='flex'
        newPage.classList.add('active')
    } else if(direction ==='left'){
        currentPage.classList.remove('active')
        currentPage.classList.add('off-right')

        newPage.classList.remove('off-right','off-left')
        newPage.classList.add('off-left')

        newPage.offsetWidth
        newPage.classList.remove('off-left')
        newPage.style.display='flex'
        newPage.classList.add('active')
    }

    setTimeout(()=>{
        currentPage.classList.remove('off-left','off-right')
        currentPage=newPage
    },500)
}






