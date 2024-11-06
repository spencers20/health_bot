const querry=document.getElementById('question')
const btn=document.getElementById('btn')

const btn2=document.getElementById('btn2')




querry.addEventListener('keydown',async(event)=>{
    console.log(event.key)
    if (event.key === 'Enter'){
        event.preventDefault()
        btn2.style.visibility='hidden'
        console.log('Enter key pressed')
    }
})

btn.addEventListener('click',async()=>{
    if  (querry.value===''){
        btn2.style.visibility='visible'
    } else{
        await fetch('/ask',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({message:querry.value})
        })
        btn2.style.visibility='hidden'
    }

    console.log('button clicked')
})
