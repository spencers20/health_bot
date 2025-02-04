
const currentdate=document.getElementById('currentdate')
// const entrytype=document.getElementById('entrytype')
const duration =document.getElementById('duration')
const entry=document.getElementById('entry')
const entriestype=document.getElementById('entriestype')
const currenttype=document.getElementById('currenttype')
const entryclassification=document.getElementById('entryclassification')
const weektime=document.getElementById('weektime')
const monthtime=document.getElementById('monthtime')
const yeartime=document.getElementById('yeartime')
const customtime=document.getElementById('customtime')
const bin=document.getElementById('bin')
const starred=document.getElementById('starred')
const allentry=document.getElementById('allentry')
const tittle=document.getElementById('title')
const description=document.getElementById('description')
const selection=document.getElementById('selection')
const starsvg=document.getElementById('starsvg')
const deletesvg=document.getElementById('deletesvg')
const downloadsvg=document.querySelector('.export')  // Changed to select by class
const allcheckbox=document.getElementById('checkbox')
const onehistory=document.querySelector('entry_history')
const maincheckbox = document.getElementById('checkbox')
const currententry=document.getElementById('currententry')
const symptoms=document.getElementById('symptoms')
const allentries=document.getElementById('allentries')
const checkups=document.getElementById('checkups')


// const historyelements=require('./reusablecomponents.js')
let options
const date=new Date()
options={weekday:'long',day:'numeric',month:'numeric',year:'numeric'}
const formattedDate=date.toLocaleDateString('en-US',options)
currentdate.textContent=formattedDate




function typeDropdown(){
    try{  
        console.log('currenttype clicked')
        const entrytype=currenttype.innerHTML.trim();  
        console.log('entrytype',entrytype)
        const computedStyle=window.getComputedStyle(entriestype).display

        if(computedStyle=='none'){
            entriestype.style.setProperty('display','flex','important')
            entrytype.includes('all entries')?allentries.style.display='none': allentries.style.display='flex'
            entrytype.includes('symptoms diary')?symptoms.style.display='none': symptoms.style.display='flex'
            entrytype.includes('daily diary')?checkups.style.display='none': checkups.style.display='flex'
            
            
        } else{
            entriestype.style.setProperty('display','none','important')
        }
    
       
    }catch(e){
        console.log(e)
    }
}

duration.addEventListener('click',()=>{
    try{
        if(weektime.style.display=='none' || monthtime.style.display=='none' || yeartime.style.display=='none' || customtime.style.display=='none'){
            weektime.style.display='block'
            monthtime.style.display='block'
            yeartime.style.display='block'
            customtime.style.display='block'
        } else {
            weektime.style.display='none'
            monthtime.style.display='none'
            yeartime.style.display='none'
            customtime.style.display='none'
        }
    }
    catch(e){
        console.log(e)
    }

})


function classificationDropdown(){
    try{
        console.log('currententry', currententry.innerHTML)
        const currenttentry=currententry.innerHTML.trim();
        const computedstyle=window.getComputedStyle(entryclassification).display
        console.log("computedstyle",computedstyle)
        if(computedstyle=='none'){
            currenttentry.includes('all entries')?allentry.style.display='none':allentry.style.display='flex'
            currenttentry.includes('starred entry')?starred.style.display='none':starred.style.display='flex'
  
            entryclassification.style.setProperty('display','flex','important')
        }else{
            entryclassification.style.setProperty('display','none','important')
        }
         
    } catch(e){
        console.log("error in entryclassification",e)
    }
}


let keydate=[];
let alldates=[]
let allcheckboxes 

function historyelements(results, entries) {
    // Clear existing entries first
    entries.innerHTML = '';
    const wrapperentries=document.createElement('div')
    wrapperentries.innerHTML=''
    entries.appendChild(wrapperentries)
    // entries.innerHTML = '';

        
    // results.forEach(doc => {
          results.forEach(entry => {
            const length=results.length
            const totalentries=document.getElementById('totalentries')
            totalentries.innerHTML=`${length} total entries`
            const entryDiv = document.createElement('div')
            entryDiv.classList.add('entry_history')

            if (!alldates.includes(entry.date)) {
                entry.chatId? alldates.push(entry.chatId):alldates.push(entry.date)
                
            }   
            Array.isArray(alldates) ? console.log('alldates is an array',alldates): console.log('alldates is not an array', alldates)
            alldates.forEach(date=>{
                const dates=new Date(date)
                isNaN(dates.getTime())? console.log('date is a chatId',date):console.log('date is a valid date',dates)
            })
            
            const entrycheckbox=document.createElement('input')
            entrycheckbox.type='checkbox'
            entrycheckbox.classList.add('entry-checkbox')
            //set attribute to get the checked details
            entrycheckbox.setAttribute('details.date',entry.date)
            entrycheckbox.setAttribute('details.tittle', entry.tittle)
            entrycheckbox.setAttribute('details.chatId',entry.chatId)
            
            entrycheckbox.addEventListener('change', (event) => {
                console.log('event listener entered')
                checkboxbar()
                const checkbox = event.target
                const date = checkbox.getAttribute('details.date')
                const chatId = checkbox.getAttribute('details.chatId')
                
                if (checkbox.checked) {
                    if (!keydate.includes(date) || !keydate.includes(chatId)) {
                        chatId && chatId!=='undefined'? keydate.push(chatId):keydate.push(date)
                    }
                    if (!alldates.includes(date) || !alldates.includes(chatId)) {
                        chatId && chatId!=='undefined'? alldates.push(chatId):alldates.push(date)
                    }
                    console.log(`alldates : ${alldates} , allkeydates : ${keydate}`)
                } else {
                    const index = keydate.indexOf(date)
                    const chatindex=keydate.indexOf(chatId)
                    if (index !== -1 || chatindex !== -1) {
                        keydate.splice(index, 1)
                        keydate.splice(chatindex, 1)
                    }
                    const index2 = alldates.indexOf(date)
                    const chatindex2 = alldates.indexOf(chatId)
                    if (index2 !== -1 || chatindex2 !== -1) {
                        alldates.splice(index2, 1)
                        alldates.splice(chatindex2, 1)
                        console.log('remaining dates', alldates)
                    }
                    if (maincheckbox) {
                        maincheckbox.checked = false
                    }
                    console.log('checkbox unchecked')
                }
            })
               
            entryDiv.appendChild(entrycheckbox)

            const detailscontainer = document.createElement('div')
            detailscontainer.classList.add('detailscontainer')

            detailscontainer.addEventListener('click', () => {
                console.log('detailscontainer clicked')
                const popup = document.createElement('div')
                popup.classList.add('popup')
                document.body.appendChild(popup)
                popup.style.display = 'flex'

                const popupcontent = document.createElement('div')
                popupcontent.classList.add('popup-content')
                popup.appendChild(popupcontent)

                const popdate = document.createElement('span')
                popdate.style.marginLeft = '500px'
                const currentdate = new Date(entry.date).toLocaleDateString('en-US', options)
                popdate.innerHTML = currentdate   
                popupcontent.appendChild(popdate)

                const poptittle = document.createElement('span')
                poptittle.style.fontSize = '20px'
                poptittle.innerHTML = entry.tittle
                popupcontent.appendChild(poptittle)

                const lineBreak = document.createElement('br')
                popupcontent.appendChild(lineBreak)
                if(entry.chatId){
                    const popdescription = document.createElement('span')
                    popdescription.innerHTML = entry.summary
                    popupcontent.appendChild(popdescription)

                    const popbutton=document.createElement('button')
                    popbutton.innerHTML='view chats'
                    popbutton.style.width='100px'
                    popbutton.style.height='50px'
                    popupcontent.appendChild(popbutton)

                    const lineBreak = document.createElement('br')
                    popupcontent.appendChild(lineBreak)

                    popbutton.addEventListener('click',()=>{
                        popupcontent.style.overflowY='auto'
                        popupcontent.style.height='70%'
                        popupcontent.style.width='70%'
                        popbutton.style.display='none'

                        entry.conversations.map(conversation=>{
                        const chatquestion = document.createElement('span')
                        chatquestion.classList.add('chatquestion')
                        chatquestion.innerHTML=conversation.question
                        popupcontent.appendChild(chatquestion)

                        const chatresponse=document.createElement('span')
                        chatresponse.classList.add('response')
                        chatresponse.innerHTML=conversation.response
                        popupcontent.appendChild(chatresponse)


                        })
                    })


                }else{

                    const popdescription = document.createElement('span')
                    popdescription.innerHTML = entry.description
                    popupcontent.appendChild(popdescription)
                }


                document.addEventListener('click',(e)=>{
                    if(e.target==popup){
                        document.body.removeChild(popup)
                    }
                })

               
            })

            const entry_details = document.createElement('div')
            entry_details.classList.add('entrydetails')
            detailscontainer.appendChild(entry_details)

            const entry_tittle = document.createElement('span')
            entry_tittle.style.marginLeft = '10px'
            entry_tittle.style.marginBottom = '5px'
            entry_tittle.style.fontSize = '18px'
            entry_tittle.style.fontWeight = '100'
            entry_tittle.style.fontFamily = 'serif'
            entry_tittle.innerHTML = entry.tittle
            entry_details.appendChild(entry_tittle)

            const entry_description = document.createElement('span')
            entry_description.style.marginLeft = '10px'
            entry_description.style.marginBottom = '5px'
            entry_description.style.width = '300px'
            const stringentrydesc = String(entry.summary)
            const words = stringentrydesc.split(' ')
            entry_description.innerHTML = words.slice(0, 7).join(' ') + '...'
            entry_details.appendChild(entry_description)

            const entry_date = document.createElement('span')
            entry_date.style.marginLeft = '150px'
            entry_date.style.marginBottom = '5px'
            entry_date.innerHTML = entry.date
            detailscontainer.appendChild(entry_date)

            entryDiv.appendChild(detailscontainer)
            wrapperentries.appendChild(entryDiv)
        })
    // })
}

 

async function gethistory(){
    try{

        const historydetails=await fetch('/user/myhistory')
        const results =await historydetails.json()
        const entries=document.querySelector('.entries')
        console.log('results an array', Array.isArray(results))   
        console.log(`results.length  ${results.length}`  )
        historyelements(results,entries)
        
        updateallcheckboxes()
        console.log(results)
    } catch(e){
        console.log("error calling history",e)
    }

}




async function getstarred() {
    try{
        console.log('getstarred clicked')
        const starreddetails=await fetch('/user/myhistory')   
        const starentry=await starreddetails.json()
        const results=[]
        starentry.forEach((entry)=>{
            if (entry.status==='starred'){
                results.push(entry)
            }
        })

        console.log(`results.length  ${results.length}`  )
        const entries=document.querySelector('.entries')
        // entries.innerHTML = ''; // Clear all existing entries first
        historyelements(results,entries)
        updateallcheckboxes()
    }catch(e){
        console.log('error getstarred',e )

    }
    
}
// starred classification listener
starred.addEventListener('click',async()=>{
    console.log('starred opened')
    await getstarred()
    currententry.innerHTML='starred entry'
    entryclassification.style.display='none'
    const starpath=document.getElementById('starpath')
    // if(starpath.getAttribute('fill'==='grey')){
    //     starpath.setAttribute('fill','blue')
    // } else{
    //     starpath.setAttribute('fill','grey')
    // }
    // allentry.style.display='flex'
    // starred.style.display='none'
     
    
    

}
    )

    // all entry classification listener
allentry.addEventListener('click',async()=>{
    await gethistory()
    console.log('allentry opened')
    currententry.innerHTML='all entries'
    entryclassification.style.display='none'
   
   
})
// symptom entry type event listener to display symptom checker histories
symptoms.addEventListener('click',async()=>{
    try{
        //updating the dropdown menu
        currenttype.innerHTML='symptoms diary'
        entriestype.style.display='none'
        
         //getting the symptoms from the backend
        const historydetails=await fetch('/user/myhistory')
        const result =await historydetails.json()
        const entries=document.querySelector('.entries')
        const results=[]
        result.forEach((entry)=>{
            if(entry.chatId){
                results.push(entry)
            }
        })


        

        historyelements(results,entries)    
        updateallcheckboxes()


    }catch(e){
        console.log('error in getting symptoms histories',e)
    }
})

// all entries to display all both chats and checkupd history
allentries.addEventListener('click', async()=>{

    await gethistory()
    currenttype.innerHTML='all entries'   
    
    entriestype.style.display='none'
    updateallcheckboxes()
})

// view checkup histories   

checkups.addEventListener('click',async()=>{
    try{
        //updating the dropdown menu
        entriestype.style.display='none'
        currenttype.innerHTML='daily diary'
        // checkups.style.display='none'
        
        const historydetails=await fetch('/user/myhistory')
        const result=await historydetails.json()
        const entries=document.querySelector('.entries')

        const currenttentry=currententry.innerHTML.trim()

        if (currenttentry.includes('starred entry')){
            const results=[]

            result.forEach((entry)=>{
                if(!entry.chatId && entry.status=='starred'){
                    results.push(entry)
                }
                !entry.chatId
            })
            historyelements(results,entries)
            updateallcheckboxes()      
        } else{
            const results=[]
            result.forEach((entry)=>{
                if(!entry.chatId){
                    results.push(entry)
                }
                
            })
        
    
           historyelements(results,entries)
           updateallcheckboxes()
        }

    }catch(e){
        console.log('error in getting daily checkups histories',e)
    }
})

document.addEventListener('DOMContentLoaded',async()=>{
    await gethistory()  
    // countunchecked()
    maincheckbox.addEventListener('change',handleselect)

    
})

// const allcheckboxes=document.querySelectorAll('.entry-checkbox')

// allcheckbox contains all the checkboxes in the details list

const updateallcheckboxes=()=>{
    allcheckboxes=document.querySelectorAll('.entry-checkbox') //takes any checkbox witth clas name entry-checkbox
    console.log('updated checkboxes', allcheckboxes)
    // console.log(Array.isArray(allcheckboxes)) 
    return allcheckboxes

}


const countstatement=document.getElementById('countstatement')


const countunchecked=()=>{
    updateallcheckboxes()
    //turns allcheckboxes to an then counts those which are not checked
    const uncheckedcount=Array.from(allcheckboxes).filter(checkbox=>!checkbox.checked).length
    const totalentries=document.getElementById('totalentries')
    totalentries.innerHTML=`${uncheckedcount} total entries`
    return uncheckedcount
   
}
//count all selected entries
const countchecked=()=>{
    updateallcheckboxes()
    const checkedcount=Array.from(allcheckboxes).filter(checkbox=>checkbox.checked).length
    countstatement.innerHTML=`${checkedcount} selected entries`
    console.log('checkedcount:',checkedcount)
    return checkedcount

}

// handle the main checkbox to check all checkboxes
function handleselect(event){
    console.log('handleselect function entered...', event.target.checked)
    const date =checkbox.getAttribute('details.date')
    allcheckboxes.forEach(checkbox=>{
        checkbox.checked=event.target.checked
        console.log(" allcheckboxes checked", alldates)

    })
    const count=countchecked()
    console.log('count ',count)
   

    if (checkbox.checked==true){
                selection.style.display='flex'
            
                // if (!keydate.includes(date)){
                //     keydate.push(date)
                // }
     } else{
        event.target.checked==false
        const index=keydate.indexOf(date)
        if(index !==-1){
            keydate.splice(index,1)
        }
                selection.style.display='none'
    }
                
    
}

//this function ensures that a checkbox is unchecked once its keydate is removed from the keydates array  
function uncheckcheckbox(){
    updateallcheckboxes()
    allcheckboxes.forEach(checkbox=>{
        const date =checkbox.getAttribute('details.date')
        if(!keydate.includes(date)){
            checkbox.checked=false
        } else if (!alldates.includes(data)){
            checkbox.checked=false
        }
        
    })
  
}

// function for each checkbox...to count the checked checkbox and open the selection display
function checkboxbar(){
    console.log('checkboxbar function entered...')
    const count=countchecked()
    console.log('count ',count)
    if (count > 0){
        selection.style.display='flex'
    } else{
        selection.style.display='none'
       
    }
}

// Get both download SVGs
const downloadsvgHeader = document.getElementById('downloadsvg-header')
const downloadsvgSelection = document.getElementById('downloadsvg-selection')

// Function to handle download
async function handleDownload() {
    try {
        console.log('download key pressed...')
        let keyydate
        if (maincheckbox.checked == true) {
            keyydate = alldates
        } else {
            keyydate = keydate
        }
        const params = keyydate.map(date => `keydate=${encodeURIComponent(date)}`).join('&')
        await fetch(`/user/download?${params}`, {
            method: 'GET',
          
        })
        .then(response => {
            
            if (!response.ok) {
                throw new Error('the response was not ok', response)
            }
            return response.blob()
        }).then(blob => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.style.display = "flex"
            a.href = url
            a.download = 'histories.pdf'

            document.body.appendChild(a)
            a.click()

            // Cleanup
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            // maincheckbox==true? maincheckbox.checked=false: maincheckbox.checked=true
        })
        .then(()=>{

            allcheckboxes.forEach(checkbox=>{
                if(checkbox.checked===true){
                    const index=keydate.indexOf(keyydate)
                    if (index !==-1){
                        keydate.splice(index,1)
                    } 
                    checkbox.checked=false
                }
            })
            selection.style.display='none'
        }
            
        )
    } catch(e) {
        console.log('error in the downloadsvg', e)
    }
}

// Add click event listeners to both download SVGs
downloadsvgHeader.addEventListener('click', handleDownload)
downloadsvgSelection.addEventListener('click', handleDownload)



// starred saving
starsvg.addEventListener('click',async()=>{
    try{
        console.log('starsvg entered...')
        console.log('starred clicked')
        console.log('starred dates',keydate)
        let keyydate
        if(maincheckbox.checked==true){
            keyydate=alldates
        }
        else{
            keyydate=keydate
        }

        console.log('keyydate',keyydate)


        const results=await fetch('/user/updates',{
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({keyydate})
        })

        console.log('starred update results', results)

        if(results.ok==true){
            // console.log('results of starsvg',results)
            alert('Entry starred successfully')
            allcheckboxes.forEach(checkbox=>{
                if(checkbox.checked===true){
                    const index=keydate.indexOf(keyydate)
                    if (index !==-1){
                        keydate.splice(index,1)
                    } 
                    checkbox.checked=false
                }
            })
            selection.style.display='none'

        }

    } catch(e){
        console.log('error to send keydates to updates: ',e)
    }
    
})
//delete selected entries
deletesvg.addEventListener('click',async()=>{
    console.log('keydates', keydate)
    let keyydate
    if(maincheckbox.checked==true){
        keyydate=alldates
    }
    else{
        keyydate=keydate
    }

    console.log('keyydate',keyydate)
    console.log("delete key pressed")
    const results=await fetch('/user/delete',{
        method:'POST',
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(keyydate)
    })

    console.log('delete results',results)
    if(results.ok==true){
        alert('deleted succesfully')
        selection.style.display='none'
        if (allentry.innerHTML.trim()==='starred entry '){
            await getstarred()
        } else{
          await gethistory()
        }
    }


    
})
