const currentdate=document.getElementById('currentdate')
const save=document.getElementById('save')
const  describe=document.getElementById('describe')
const tittle=document.getElementById('symptom-title')
const newentry=document.getElementById('newentry')

const date=new Date()
const options={ weekday:"short", day:"numeric",month :"numeric" ,year:"numeric"}
const formattedDate=date.toLocaleDateString("en-US",options)
currentdate.textContent=formattedDate

save.addEventListener('click',async()=>{
    try{
        console.log("clicked")
       

        const message={
            tittle:tittle.value,
            description:describe.value
        }
        
        const results= await fetch('/user/storehistory',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(message)
        })

        
        console.log( "saved history results",results)
        
        save.style.color="green"  
        save.innerHTML="Saved" 

        // const results=await result.json()
        // console.log(results)
    
        // save.innerHTML="Saved"
        

    }catch(e){
        console.log("error in sending data",e)
    }
})

newentry.addEventListener('click',async()=>{
    try{
        tittle.value=""         
        describe.value=""
        save.style.color="blue"
        save.innerHTML="Save"

    }catch(e){
        console.log("error in refreshing page",e)
    }
})


