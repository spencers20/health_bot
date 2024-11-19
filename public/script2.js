const input=document.getElementById('question')
const btn=document.getElementById('btn')
const container = document.querySelector('.container')
const question = document.getElementById('question')
const btn2=document.getElementById('btn2')
const intro=document.getElementById('intro')
const chatContainer=document.getElementById('chat-container')
const newchat=document.querySelector('.new-chat')
// const {getdb}=require('../config/database')
// import {getdb} from '../config/database'



function formatTextToHTML(text) {
    return text
      .replace(/\n/g, '<br>') // Convert newlines to <br>
      .replace(/\* (.+?)(\n|$)/g, '<li>$1</li>') // Convert * bullet points to <li>
      .replace(/(?:<li>.+?<\/li>)+/g, '<ul>$&</ul>'); // Wrap <li> in <ul>
  }


//function for sending a message
async function sendmessage() {
    try{


        chatContainer.style.display='block'

        const topRightMessage=document.createElement('div')
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

        const respons= document.createElement('div')
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
        chatContainer.style.display='none'
        input.value=''
        intro.style.opacity= 1
        // input.classList.add('search-bar')
        input.classList.remove('bottom-input')
        btn2.style.visibility='visible'
      

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
