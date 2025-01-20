export function historyelements(results, entries){
    
    results.forEach(doc=>{
        doc.histories.forEach(entry=>{

            entryDiv=document.createElement('div')
            entryDiv.classList.add('entry_history')

            if(!alldates.includes(entry.date)){
                alldates.push(entry.date)

            }

            
            const entrycheckbox=document.createElement('input')
            entrycheckbox.type='checkbox'
            entrycheckbox.classList.add('entry-checkbox')
            //set attribute to get the checked details
            entrycheckbox.setAttribute('details.date',entry.date)
            entrycheckbox.setAttribute('details.tittle', entry.tittle)


            
            entrycheckbox.addEventListener('change', (event)=>{
                console.log('event listener entered')
                checkboxbar()
                const checkbox=event.target
                const date =checkbox.getAttribute('details.date')
                // const date=new Date(date)
                if (checkbox.checked){
                    if (!keydate.includes(date)){
                        keydate.push(date)
                    }

                    if (!alldates.includes(date)){
                        alldates.push(date)
                    }

                    console.log(`alldates : ${alldates} , allkeydates : ${keydate}`)

                
                }
                else{
                    const index =keydate.indexOf(date)

                    if(index !==-1){
                        keydate.splice(index,1)
                    }

                    const index2=alldates.indexOf(date)
                    if(index2 !==-1){
                        alldates.splice(index2,1)
                        console.log('remaining dates',alldates)
                    }

                    
                    console.log('checkbox unchecked')
                }
            })
                
            entryDiv.appendChild(entrycheckbox)


            const detailscontainer=document.createElement('div')
            detailscontainer.classList.add('detailscontainer')

            detailscontainer.addEventListener('click',()=>{
                console.log ('detailscontainer clicked')
                const popup=document.createElement('div')
                popup.classList.add('popup')
                document.body.appendChild(popup)
                popup.style.display='flex'

                const popupcontent=document.createElement('div')
                popupcontent.classList.add('popup-content')
                popup.appendChild(popupcontent)


                const popdate=document.createElement('span')
                popdate.style.marginLeft='500px'
                const currentdate=new Date(entry.date).toLocaleDateString('en-US', options)
                popdate.innerHTML=currentdate   
                popupcontent.appendChild(popdate)
                console.log("date",entry.date)

                const poptittle=document.createElement('span')
                poptittle.style.fontSize='20px'
                poptittle.innerHTML=entry.tittle
                popupcontent.appendChild(poptittle)

                const lineBreak = document.createElement('br')
                popupcontent.appendChild(lineBreak)

                const popdescription=document.createElement('span')
                popdescription.innerHTML=entry.description
                popupcontent.appendChild(popdescription)

                document.addEventListener('click',(e)=>{
                    if(e.target==popup){
                        document.body.removeChild(popup)
                    }
                })

               
            })


            entry_details=document.createElement('div')
            entry_details.classList.add('entrydetails')
            detailscontainer.appendChild(entry_details)

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
            detailscontainer.appendChild(entry_date)

            entryDiv.appendChild(detailscontainer)

            entries.appendChild(entryDiv)





            console.log("date",entry.date)
            console.log("tittle",entry.tittle)
            console.log("description",entry.description)    


        })
    })
}

 