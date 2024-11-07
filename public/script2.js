const input=document.getElementById('question')
const btn=document.getElementById('btn')
const container = document.querySelector('.container')
const question = document.getElementById('question')
const btn2=document.getElementById('btn2')
const intro=document.getElementById('intro')
const chatContainer=document.getElementById('chat-container')


async function sendmessage() {
    try{


        chatContainer.style.visibility='visible'

        const topRightMessage=document.createElement('div')
        topRightMessage.classList.add('userMessage')
        topRightMessage.textContent= input.value
        chatContainer.appendChild(topRightMessage)

        input.classList.add('bottom-input')

        btn.classList.add('bottom-input')
        intro.style.opacity= 0


        const response= await fetch('/ask',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({message:input.value})

        })

        const result=await response.json()
        const txtresponse=result.text
        console.log(txtresponse)

        const respons= document.createElement('div')
        respons.classList.add('response')
        respons.textContent= 'Response: ' +txtresponse
        chatContainer.appendChild(respons)

        //reset the input area
        input.value='' 

        
    } catch (e){

        console.log(`error in sending message: ${e}`)


    }
    
}


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
