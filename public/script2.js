const input=document.getElementById('question')
const btn=document.getElementById('btn')
const container = document.querySelector('.container')
const question = document.getElementById('question')
const btn2=document.getElementById('btn2')
const intro=document.getElementById('intro')
const chatContainer=document.getElementById('chat-container')
const newchat=document.querySelector('.new-chat')
const sidebar=document.querySelector('.side-bar')
const editvalue=document.getElementById('edit-value')
const thevalue=document.getElementById('tempvalue')
const conditiondegree=document.getElementById('conditiondegree')
const valueinput=document.getElementById('value-input')



function formatTextToHTML(text) {
    return text
      .replace(/\n/g, '<br>') // Convert newlines to <br>
      .replace(/\* (.+?)(\n|$)/g, '<li>$1</li>') // Convert * bullet points to <li>
      .replace(/(?:<li>.+?<\/li>)+/g, '<ul>$&</ul>'); // Wrap <li> in <ul>
  }

async function gettips(){
    try{
        const alltips=await fetch('tips')
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

editvalue.addEventListener('click',()=>{
    valueinput.innerHTML=''
    thevalue.style.display='none'
    conditiondegree.style.display='none'
    valueinput.style.display='flex'
})

valueinput.addEventListener('keydown',(e)=>{
    if (e.key==='Enter'){
        const values=valueinput.value
        thevalue.innerHTML=values + '&deg;c'
        valueinput.style.display='none'
        thevalue.style.display='flex'
        conditiondegree.style.display='flex'
        if(values >38){
              conditiondegree.innerHTML='Critical'
                conditiondegree.style.color='Red'
        }

    }
})

document.addEventListener('DOMContentLoaded',async()=>{
    await gettips()
    setInterval(async()=>{ await gettips()},10000);
})








//function for sending a message
async function sendmessage() {
    try{


        chatContainer.style.display='block'

         topRightMessage=document.createElement('div')
        topRightMessage.classList.add('userMessage')
        topRightMessage.textContent= input.value 
        chatContainer.appendChild(topRightMessage)

        input.classList.add('bottom-input')

        btn.classList.add('bottom-input')
        intro.style.opacity= 0


        const response= await fetch('/user/chat',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({message:input.value})

        })

        const result=await response.json()
        const txtresponse=formatTextToHTML(result.text)
        console.log(txtresponse)

        respons= document.createElement('div')
        respons.classList.add('response')
        respons.innerHTML= 'Response: <br> ' +txtresponse
        chatContainer.appendChild(respons)

        //reset the input area
        input.value='' 

        
    } catch (e){

        console.log(`error in sending message: ${e}`)

    }

}

newchat.addEventListener('click',async()=>{
    try{
        await fetch('/user/newchat',{method:'PUT'})
        chatContainer.style.opacity=0
       
        input.value=''
        intro.style.opacity= 1
        // input.classList.add('search-bar')
        input.classList.remove('bottom-input')
        btn2.style.visibility='visible'
        topRightMessage.textContent=''
        respons.value=''
      

    }catch(e){
        console.log(`error in creating new chat in new-chat button: ${e}`)
    }

})


input.addEventListener('keydown',async(event)=>{
    console.log(event.key)
    if (event.key === 'Enter'){
        event.preventDefault()
        btn2.style.visibility='hidden'
    
        console.log('Enter key pressed')

        //call the sendmessage function
        sendmessage()

    }
})

btn.addEventListener('click',async()=>{
    if  (input.value===''){
        btn2.style.visibility='visible'
    } else{
        await fetch('/ask',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({message:input.value})
        })
        btn2.style.visibility='hidden'
    }

    console.log('button clicked')
})
