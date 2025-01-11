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

entryclassification.addEventListener('click',()=>{
    try{
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
        console.log(e)
    }
}
)
       
