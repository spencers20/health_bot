
const currentdate=document.getElementById('currentdate')
// const entrytype=document.getElementById('entrytype')
const duration =document.getElementById('duration')
const entry=document.getElementById('entry')
const entriestype=document.getElementById('entriestype')
const symptoms=document.getElementById('symptoms')
const checkups=document.getElementById('checkups')
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


const date=new Date()
const options={weekday:'long',day:'numeric',month:'numeric',year:'numeric'}
const formattedDate=date.toLocaleDateString('en-US',options)
currentdate.textContent=formattedDate

entriestype.addEventListener('click',()=>{
    try{
        if (symptoms.style.display=='none' || checkups.style.display=='none'){
            console.log('clicked')
            // duration.style.height='70px'
            // entryclassification.style.height='70px'
            // entriestype.style.minHeight='100px'
            symptoms.style.display='block'
            checkups.style.display='block'
            
        } else {
            entriestype.style.height='70px'
            symptoms.style.display='none'
            checkups.style.display='none'
        }
       
    }catch(e){
        console.log(e)
    }
})

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

entryclassification.addEventListener('click',async()=>{
    try{
        // await gethistory()
        if(bin.style.display=='none' || starred.style.display=='none' || allentry.style.display=='none'){
            bin.style.display='block'
            starred.style.display='block'
            allentry.style.display='block'
        } else {
            bin.style.display='none'
            starred.style.display='none'
            // allentry.style.display='none'
        }
    } catch(e){
        console.log("error in entryclassification",e)
    }
}
)

async function gethistory(){
    try{

        const historydetails=await fetch('/entries')
       
        const results=await historydetails.json()
        const entries=document.querySelector('.entries')
    
        results.forEach(doc=>{
            doc.histories.forEach(entry=>{

                entryDiv=document.createElement('div')
                entryDiv.classList.add('entry_history')
                
                
                const entrycheckbox=document.createElement('input')
                entrycheckbox.type='checkbox'
                entrycheckbox.style.marginBottom='5px'
                entryDiv.appendChild(entrycheckbox)


                entry_details=document.createElement('div')
                entry_details.classList.add('entrydetails')
                entryDiv.appendChild(entry_details)

                entry_tittle=document.createElement('span')
                entry_tittle.style.marginLeft='10px'
                entry_tittle.style.marginBottom='5px'
                entry_tittle.style.fontSize='18px'
                entry_tittle.style.fontWeight='100'
                entry_tittle.style.fontFamily='serif'
                entry_tittle.innerHTML=entry.tittle
                entry_details.appendChild(entry_tittle)

                entry_description=document.createElement('span')
                entry_description.style.marginLeft='10px'
                entry_description.style.marginBottom='5px'
                entry_description.style.width='300px'
                const stringentrydesc=String(entry.description)
                const words= stringentrydesc.split(' ')
                entry_description.innerHTML=words.slice(0,7).join(' ')+'...'
                // console.log(words.slice(0,7).join(' ')+'...')
                entry_details.appendChild(entry_description)

                entry_date=document.createElement('span')
                entry_date.style.marginLeft='150px'
                entry_date.style.marginBottom='5px'
                entry_date.innerHTML=entry.date
                entryDiv.appendChild(entry_date)

                entries.appendChild(entryDiv)





                console.log("date",entry.date)
                console.log("tittle",entry.tittle)
                console.log("description",entry.description)    
    
    
            })
        })
        console.log(results)
    } catch(e){
        console.log("error calling history",e)
    }

}

document.addEventListener('DOMContentLoaded',async()=>{
    await gethistory()
})


