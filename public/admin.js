

const formdoc=document.getElementById('add-doc')
let doctors
let nurses
let allparties
async function everyparticipant(){
    const all=await fetch('/allparticipants')
    
    return await all.json()
}
document.addEventListener('DOMContentLoaded',async()=>{
    try{
        allparties=await everyparticipant()
        console.log(allparties)
        doctors=allparties.alldocs
        nurses=allparties.allnurses
        document.getElementById('usercount').textContent=allparties.allusers.length
        displaydocs(doctors)
        displaynurses(nurses)

        console.log('doctors...',doctors)


    }catch(e){
        console.error('error in loading dom content..',e)
    }
})

function displaydocs(doctors){
    try{
        document.getElementById('doctorcount').textContent=doctors.length
    
        const docscontainer=document.querySelector('.all-docs')
        docscontainer.innerHTML=''
        doctors.forEach(doc => {
            docscontainer.innerHTML +=`
               <div style="display: flex; align-items: center; margin-top: 10px; border-bottom: 1px solid #5e5e5e; padding: 10px 5px; height: 60px;">
                            <div style="width: 70px; height: 70px; margin-right: 15px; border-radius: 50%; background-image: url(${doc.image}); background-size: cover; background-position: 50% 20%;"></div>
                            <div style="flex-grow: 1;">
                                <span id="docid" style="display: block; font-weight: bold; color: #333;">${doc._id}</span>
                                <span id="name" style="display: block; font-size: 14px; color: #555;">${doc.name}</span>
                                <span id="speciality" style="display: block; font-size: 13px; color: #777;">${doc.speciality}</span>
                            </div>
                            <div class="removedoc" style="color: red; cursor: pointer; font-weight: bold;">Remove</div>
                        </div>

            `
            
            
            
        });
        
        const removedocs=document.querySelectorAll('.removedoc')
        removedocs.forEach((removedoc,index)=>{
            removedoc.addEventListener('click',async()=>{
                try{
                    const confirmation=confirm('Removing doc will permanently delete the doctor from the system')
                    if(!confirmation){return}
                    const partyId=doctors[index]._id
                    console.log(partyId)
                    const deletedoc=await fetch('/remove',{
                        method:'POST',
                        headers:{
                            'Content-Type':'application/json'
                        },
                        body:JSON.stringify({partyId})
                    })
                    const deleteresponse=await deletedoc.json()
                    if(deleteresponse.message){
                        alert(deleteresponse.message)
                        removedoc.parentElement.remove()
                        displaydocs(doctors)
                    }else{
                        alert(deleteresponse.error)  
                    }

                }catch(e){
                    console.error('error in deleting doc',e)
                }
            })

        })
        
    }catch(e){
        console.error('error in displaying doctors..',e)
    }
}

function displaynurses(nurses){
    try{
        document.getElementById('nursecount').textContent=nurses.length
        const nursecontainer=document.querySelector('.all-nurses')
        nursecontainer.innerHTML=''
        nurses.forEach(nurse => {
            
            nursecontainer.innerHTML +=`
               <div class="nurse-card" style="display: flex; align-items: center; margin-top: 10px; border-bottom: 1px solid #5e5e5e; padding: 10px 5px; height: 60px;">
                            <div class='prof-pic' style="width: 70px; height: 70px; margin-right: 15px; border-radius: 50%; background-image: url(${nurse.image}); background-size: cover; background-position: 50% 20%;"></div>
                            <div style="flex-grow: 1;">
                                <span id="docid" style="display: block; font-weight: bold; color: #333;">${nurse._id}</span>
                                <span id="name" style="display: block; font-size: 14px; color: #555;">${nurse.name}</span>
                                
                            </div>
                            <div class="removenurse" style="color: red; cursor: pointer; font-weight: bold;">Remove</div>
                        </div>

            `
            
            
            
        });
        const nursecard=document.querySelectorAll('.nurse-card')
        nursecard.forEach((card,index)=>{
            const nurse=nurses[index]
            const profpic=card.querySelector('.prof-pic')
            const removenurse=card.querySelector('.removenurse')
            if(!nurse.image || nurse.image==''){
                const abbrevs=nurse.name.trim().split(" ")[0][0].toUpperCase()+nurse.name.trim().split(" ")[1][0].toUpperCase()
                console.log('abbreviations...',abbrevs)
                profpic.innerHTML=abbrevs
                profpic.style.backgroundImage=''
                profpic.classList.add('no-image')
            }
           removenurse.addEventListener('click',async()=>{
                try{
                    const partyId=nurse._id
                    const confirmation=confirm(`Removing nurse will permanently delete ${partyId}from the system `)
                    if(!confirmation)return;
                    const deletenurse=await fetch('/remove',{
                        method:'POST',
                        headers:{
                            'Content-Type':'application/json'
                        },
                        body:JSON.stringify(partyId)
                    })
                    const deleteresponse=await deletenurse.json()
                    if(deleteresponse.message){
                        alert(deleteresponse.message)
                        // displaynurses(nurses)
                    }else{
                        alert(deleteresponse.error)  
                    }
    
                }catch(e){
                    console.error('error in deleting nurse')
                }
            })
        })
        
    }catch(e){
        console.error('error in displaying nurses..',e)
    }
}

document.querySelectorAll('.submit').forEach(submitbtn=>{
    submitbtn.addEventListener('click',async(e)=>{
        e.preventDefault()
        try{
            let endpoint 
            let form
            if (e.target.closest('#add-doc')){
                console.log('submitting doc info...')
                form = document.getElementById('add-doc')
                endpoint='/google/createdoc'
                
            }else if(e.target.closest('#add-nurse')){
                console.log('submitting nurse info...')
                form=document.getElementById('add-nurse')
                endpoint='/google/createnurse'
               
            }

            const formdata=new FormData(form)
            console.log('formdata  collected',[...formdata.entries()])

            const response=await fetch(endpoint,{
                method:'POST',
                body:formdata
            })
            const submitted=await response.json()
            console.log('submitted doc data...',submitted)
            if(submitted.error){
                alert(submitted.error)
            }else{
                alert(submitted.message)
            }
    
        }catch(e){
            console.error('error in sending doc / nurse data...',e)
        }

    })

})


document.getElementById('adminprof').addEventListener('click',(e)=>{
    e.stopPropagation()
    console.log('adnurseminprof clicked')
    const popupprof=document.querySelector('.popup-profile')
    popupprof.style.display=popupprof.style.display=='flex'?'none':'flex'
})

window.addEventListener('click',(e)=>{
    const popupprof=document.querySelector('.popup-profile')
    if(popupprof && popupprof.style.display=='flex' &&  !e.target.closest('.popup-profile')){
        popupprof.style.display='none'
    }
})

