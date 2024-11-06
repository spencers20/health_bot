const input=document.getElementById('question')
const btn=document.getElementById('btn')
const container = document.querySelector('.container')
const respons = document.getElementById('response')
const question = document.getElementById('question')
const btn2=document.getElementById('btn2')
const intro=document.getElementById('intro')




input.addEventListener('keydown',async(event)=>{
    console.log(event.key)
    if (event.key === 'Enter'){
        event.preventDefault()
        btn2.style.visibility='hidden'

        const topRightMessage=document.createElement('div')
        topRightMessage.classList.add('top-right-message')
        topRightMessage.textContent= input.value

        document.body.appendChild(topRightMessage)

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

        respons.textContent= "Response:" + txtresponse
        respons.style.opacity =1
  


        console.log('Enter key pressed')
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
