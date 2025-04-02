const calendarEl=document.getElementById('calendar') 
const setdatebutton=document.querySelector('.session-button')
const addtime=document.querySelector('.add-button')
const availability= document.querySelectorAll('.availability')

let datenow=new Date()
const datetoday=dateFns.format(datenow,'yyyy-MM-dd')
let clickeddate;   



let events=[]
let patientappointment
let allreports
let appointmentcount=0



document.addEventListener('DOMContentLoaded',async()=>{
    try{
        // await allreports()
        
        const doctordetails=await fetch('/doctors/docsname')
        // console.log('doctordetails',doctor)
        const amdoc=await doctordetails.json()
        console.log(amdoc)
        document.getElementById('docgreeting').innerHTML='Welcome Dr.' +amdoc.name.split(' ')[1]
        document.getElementById('docimages').style.backgroundImage=`url(${amdoc.image})`
        if(amdoc.status === "away") {
            document.getElementById('away').checked = true;
        } else if(amdoc.status === "active") {
            document.getElementById('active').checked = true;
        }
        
    
    
        const response=await fetch('/doctors/getmypatients')
        const allpatients=await response.json()
        console.log('allpatients...',allpatients)
        if(allpatients.length==0){
            patientappointment=[]
            events=[]
            doccalendar(events)
            console.log('no patients')
            
        }else{
            patientappointment=allpatients.appointmentdates
            console.log(Array.isArray(patientappointment))
            
          console.log("patientappointment...",patientappointment)
            patientappointment.forEach(appointmentdate=>{
                let eventcolor;
                let description
                let status
                let tittle
                const numvisits=parseInt(appointmentdate.numvisits,10)
                const booked=appointmentdate.bookedtime.length
                const notbooked=appointmentdate.appointmenttime.length
                if(appointmentdate.date>=datetoday){

                    if(booked<numvisits){
                        tittle='Scheduled'
                        eventcolor='#ffc107'
                        description=`${booked} slots booked out of ${numvisits} set slots`
                        status=`${notbooked} Pending`
                    }else{
                        tittle='Full'
                        eventcolor='#a9e8c2'
                        description=`${booked} slots booked out of ${numvisits} set slots`
                        status=`Fully Booked`
                    }
                    events.push({
                         title:tittle,
                         start:appointmentdate.date,
                         color:eventcolor,
                         description:description,
                         status:status
                    })
                }
                const today=new Date().toISOString().split('T')[0]
                const mydate=new Date(appointmentdate.date).toISOString().split('T')[0]
                if(appointmentdate.date!==datetoday){
                    console.log(mydate,"  ", +today )
                    document.getElementById('todayno').textContent='0'
                }else{
                    appointmentcount+=1
                    const todayappointments=appointmentdate.patients.length
                    document.getElementById('todayno').textContent=todayappointments
        
                }
            })
            if (events){
                console.log("events",events)
                doccalendar(events)
            }
        }
        
        upcomingappoints()
        allappoints() //funcction for all appointment details
    
        const results=await fetch('/doctors/reportpatients')
        allreports=await results.json()//gettting the reports
        pendingrepos()//function for pending reports
    
        console.log("allpatients",allpatients)
        console.log("patientappointment",patientappointment)
        console.log('appointment count.....',appointmentcount)

    }catch(e){
        console.error('error in loading the docs page..',e)
    }
   
    
})



document.querySelector('.logout').addEventListener('click',async()=>{
    try{
        console.log('clicked logout')
        window.location.href = '/doctors/logout';

    }catch(e){
        console.error('errror in logging out',e)
    }
})
function doccalendar(events){
    const calendar=new FullCalendar.Calendar(calendarEl,{
    
        initialView:'dayGridMonth',
        selectable:true,
        dateClick:(info)=>{
             clickeddate=info.dateStr
            try{
                if(info.dateStr>datetoday){
                    const setdatealert=document.getElementById('bookdoc')
                    const checktitle=document.querySelector('.checktitle')
                    setdatealert.style.display='flex'
                  
    
                }else{
                    showCustomAlert('appointment dates are only set for future dates')
    
                   
                }
    
            } catch(e){
                console.error('errror in date ',e)
            }
        },
        height:'auto',
        headerToolbar: {
            left:'prev,next',
            center:'title',
            right:''
        },
        events: events,
        eventDidMount: function(info) {
            // Tooltip to show more details
            tippy(info.el, {
              content: `Status: ${info.event.extendedProps.status}<br>
                        Description: ${info.event.extendedProps.description}`,
              allowHTML: true
            });
          }
      
          
       
    })

    calendar.render()
    
}

availability.forEach((button)=>{
    button.addEventListener('change',async()=>{
        console.log('button status',button.value)
        const status=button.value
        if (button.value=='active'){
            button.classList.toggle('active')
        }else{
            button.classList.toggle('closed')
        }
        const results=await fetch('/doctors/setavailability',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({status})
        })

        if (results){
            const availabilityresult=await results.json()
            if(availabilityresult.message){
                showCustomAlert(availabilityresult.message)
            }else{
                showCustomAlert(availabilityresult.error)
            }
        }


    })
})
async function thereports(userId,repoId){
    try{
        const reports =await fetch('/doctors/getreport',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({userId,repoId})
        })
         
        const patientreport=await reports.json()
        console.log('my patient report...',patientreport)
        return patientreport

    }catch(e){
        console.error('error in finding the reports')
    }
}

function formatTextToHTML(text) {
    if (typeof text !== 'string') {
        console.error("Expected a string but got:", typeof text, text);
        return '';
    }

    // Convert **bold** text to <b>bold</b>
    let formattedText = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); 

    // Convert * or - bullet points to <li> (excluding numbered lists)
    formattedText = formattedText.replace(/(^|\n)[*-] (.+?)(?=\n|$)/g, '<li>$2</li>');

    // Wrap consecutive <li> elements inside a <ul>
    formattedText = formattedText.replace(/(<li>.*?<\/li>)+/gs, match => `<ul>${match}</ul>`);

    // Ensure numbered lists (1., 2., etc.) remain intact
    formattedText = formattedText.replace(/(\d+\.)\s*(.+)/g, '<br>$1 $2');

    // Convert double line breaks (paragraphs) to <p> tags
    formattedText = formattedText.replace(/\n\s*\n/g, '</p><p>');

    // Wrap the entire content in a <p> tag
    formattedText = `<p>${formattedText}</p>`;

    return formattedText;
}
function getage(birthdate){
    const today=new Date().getTime()
    const dob=new Date(birthdate).getTime()

    const ageinmili=today-dob
    age=new Date(ageinmili).getUTCFullYear()-1970
    console.log(`age in milis\n ${ageinmili} other age  ${age+1970}`)
    return age
}

function  pendingrepos(){
    try{

        if(!allreports){
            allreports=[]
            showCustomAlert('no reports')

        }
    
        const pendings=allreports.reports.map(report=>{
            const statuspending=report.patients.filter(patient=>patient.status=='pending')
            if(statuspending.length>0){
                
                return{
                    ...report,
                    patients:statuspending
                }
            }  
            return null
        }).filter(report => report !== null); 
    
            console.log("pendings..",pendings)
    
            if(pendings.length>0){
                // const totalpendings=pendings.patients
                displayreports(pendings)
            }else{
            const reports=document.querySelector('.reportschedules')
            reports.innerHTML=`
            <div style="text-align: center;padding: 20px;background-color: #f8f9fa;border-radius: 10px;width: fit-content;margin: 40px auto;box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">       
             <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="75" height="75" viewBox="0 0 32 32" enable-background="new 0 0 32 32" version="1.1" xml:space="preserve" style="display: block; margin: 0 auto; opacity: 0.7;">
                    <g>
                        <g>
                            <path d="M21.5,14.75c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75 S21.09,14.75,21.5,14.75z" fill="#263238"/>
                            <path d="M10.5,14.75c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75 S10.09,14.75,10.5,14.75z" fill="#263238"/>
                        </g>
                        <g>
                            <g>
                                <polyline fill="none" points="21.5,1.5 4.5,1.5 4.5,30.5 27.5,30.5 27.5,7.5" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                                <polyline fill="none" points="21.5,1.5 27.479,7.5 21.5,7.5 21.5,4" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                                <path d="M14.5,18.5c0-0.83,0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5" fill="none" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                            </g>
                        </g>
                    </g>
                </svg>
                <p style="color: #555; font-size: 18px; font-weight: bold; margin-top: 10px;">
                    No Pending Reports 
                </p>
            </div>`


            }
    }catch(e){
        console.error('error in pending reports..',e)
    }

}

function completereports(){
    try{
        
        const completerepos=allreports.reports.map(report=>{
            const completed=report.patients.filter(patient=>patient.status=='complete')
            if(completed.length>0){
                return{
                    ...report,
                    patients:completed
                }
            }
            return null
        }).filter(report=>report !==null)

        console.log('completed reports..',completerepos)

        if(completerepos.length>0){
            displayreports(completerepos)
        }else{
              const reports=document.querySelector('.reportschedules')
            reports.innerHTML=`
            <div style="text-align: center;padding: 20px;background-color: #f8f9fa;border-radius: 10px;width: fit-content;margin: 40px auto;box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">       
             <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="80" height="80" viewBox="0 0 32 32" enable-background="new 0 0 32 32" version="1.1" xml:space="preserve" style="display: block; margin: 0 auto; opacity: 0.7;">
                    <g>
                        <g>
                            <path d="M21.5,14.75c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75 S21.09,14.75,21.5,14.75z" fill="#263238"/>
                            <path d="M10.5,14.75c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75 S10.09,14.75,10.5,14.75z" fill="#263238"/>
                        </g>
                        <g>
                            <g>
                                <polyline fill="none" points="21.5,1.5 4.5,1.5 4.5,30.5 27.5,30.5 27.5,7.5" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                                <polyline fill="none" points="21.5,1.5 27.479,7.5 21.5,7.5 21.5,4" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                                <path d="M14.5,18.5c0-0.83,0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5" fill="none" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                            </g>
                        </g>
                    </g>
                </svg>
                <p style="color: #555; font-size: 18px; font-weight: bold; margin-top: 10px;">
                    No Complete Reports 
                </p>
            </div>`
            

        }
    }catch(e){
        console.log('error in complete reports...',e)
    }
}



function displayreports(docreports){
    try{  
        let pendingcount=0
        const reports=document.querySelector('.reportschedules')
        reports.innerHTML=''

        docreports.forEach(docrepo=>{
            if (docrepo.patients){
                docrepo.patients.forEach((incomingrepo=>{
                    // const repoheader=document.querySelector('.report-header')
                    // const repdate=repoheader.contains(repoheader)
                    // if(repdate){
                    //     d
                    // }
                    console.log('incoming report', incomingrepo.tname)
                    const name=incomingrepo.tname
                    document.querySelector('.report-header').innerHTML=''
                    //add name to the history part / entries part 
                    document.querySelector('.modal-histo').innerHTML=''
                    const histoname=document.createElement('div')
                    histoname.innerHTML=name.split(" ")[0] +' Health Diary'
                    document.querySelector('.modal-histo').appendChild(histoname)

                    //add date of report
                    const repodate=document.createElement('div')
                    repodate.innerHTML='Report Date '+ new Date(incomingrepo.reportId).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'})
                    document.querySelector('.report-header').appendChild(repodate)
                    
                    let reporttime
                    if(incomingrepo.status=="pending"){
                        pendingcount+=1
                        reporttime=new Date(incomingrepo.sentdate).toLocaleTimeString()
                    } else{
                        
                        document.getElementById('report-submit').textContent='Edit Report'
                         
                        reporttime=new Date(incomingrepo.sentdate).toISOString().split('T')[0]
                    }
                    const abbrevs=incomingrepo.tname.trim().split(" ")[0][0].toUpperCase()+incomingrepo.tname.trim().split(" ")[1][0].toUpperCase()
                        console.log(abbrevs)
                        const patientdiv=document.createElement('div')
                        patientdiv.classList.add('patient-container')
                        const backgrimage=document.createElement('div')
                        backgrimage.classList.add('profile')
                        if(incomingrepo.image){
                            backgrimage.classList.remove('no-image')
                            backgrimage.textContent=""
                            backgrimage.style.backgroundImage=`url(${incomingrepo.image})`
    
                        }else{
                            backgrimage.classList.add('no-image')
                            backgrimage.textContent=abbrevs
                        }
                        patientdiv.appendChild(backgrimage)
    
                        const infodiv=document.createElement('div')
                        infodiv.style.display='flex'
                        infodiv.style.flexDirection='column'
                        infodiv.style.margin='5px'
                        infodiv.style.marginLeft='20px'
    
                        const nametime=document.createElement('div')
                        nametime.style.display='flex'
                        nametime.style.flexDirection='row'
                        nametime.style.gap='40px' 
                        const pname=document.createElement('div')
                        pname.style.fontWeight='600'
                        pname.style.color='rgb(12, 75, 64)'
                        pname.innerHTML=incomingrepo.tname
                        nametime.appendChild(pname)
                        const date=document.createElement('div')
                        date.style.color='rgb(75, 4, 59);'
                        date.style.marginLeft='30px'
                        date.innerHTML=`Sent at  ${reporttime}`
                        nametime.appendChild(date)
                        infodiv.appendChild(nametime)
    
                        const reposummary=document.createElement('div')
                        reposummary.style.marginTop='10px'
                        reposummary.style.fontSize='15px'
                        reposummary.innerHTML=incomingrepo.reportsummary
                        infodiv.appendChild(reposummary)
    
                        const viewreport=document.createElement('div')
                        viewreport.classList.add('view-report')
                        viewreport.innerHTML='view report'
                        viewreport.addEventListener('click',async()=>{
                            // document.getElementById('reportDate').textContent=''
                            document.getElementById('reportModal').style.display='flex'
                            let report
                            console.log('incomingrepo.id',incomingrepo.id)
                            console.log('incomingreport id',incomingrepo.reportId)
                          
                            const patient=await thereports(incomingrepo.id,incomingrepo.reportId)
                            const myhistory=patient.histories
                            console.log('histories',myhistory)
                            const patientreport=patient.thereport
                            console.log('patientreport...',patientreport)
                            
                            if (patientreport){
                                const reportbody=document.querySelector('.modal-body')  
                                report=patientreport[0].reports
                                console.log('patient reports ',report)
                                const diseases=formatTextToHTML(report[0].Diagnosis[0].summary)
                                console.log('unformatted..',report[0].Diagnosis[0].summary)
                                console.log('diseases',diseases)    
                                console.log('patient found..',patientreport)
                                const age=getage(patientreport[0].birthdate)
                                // document.getElementById('reportDate').textContent = new Date(incomingrepo.sentdate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                                const mysymptoms=report[0].Diagnosis?.[0].symptoms?report[0].Diagnosis[0].symptoms:"No symptoms recorded"
                                const myassesment=report[0].nurse?.assesment?report[0].nurse.assesment:report[0].myassesment

                                // const reportid=incomingrepo.reportId'
                                
                                reportbody.innerHTML=`
                                <!-- Patient Info -->
                                <div class="section">
                                    <h3 style="align-self: center;display: flex;justify-content: center;align-items: center;">Patient Report</h3>
                                    <p><strong>Name:</strong> ${patientreport[0].name}</p>
                                    <p><strong>Age:</strong> ${age}</p>
                                    <p><strong>Gender:</strong> ${patientreport[0].gender}</p>
                                </div>
                    
                                <!-- Metrics -->
                                <div class="section">
                                    <h3>Most Recent Metrics</h3>
                                    <ul>
                                        <li><strong>Temperature:</strong> ${report[0].metrics.temperature}&deg;C</li>
                                        <li><strong>Blood Pressure:</strong> ${report[0].metrics.bloodPressure.systolic}/${report[0].metrics.bloodPressure.diastolic} mmHg</li>
                                        <li><strong>Respiratory Rate:</strong> ${report[0].metrics.temperature} breaths/min</li>
                                        <li><strong>Pulse Rate:</strong> ${report[0].metrics.temperature} bpm</li>
                                    </ul>
                                </div>
                    
                                <!-- First Diagnosis -->
                                <div class="section">
                                    <h3>Diagnosis</h3>
                                    <p><strong>Symptoms:</strong> ${mysymptoms}</p>
                                    <p><strong>Possible Diseases:</strong>${diseases}</p>
                                     
                                </div>
                                <div class="section">
                                  <h3>Nurse Assesment</h3>
                                   <p>${myassesment} </p>
                                </div>
                    
                
                                <!-- Doctor's Assessment -->
                                <div class="section">
                                    <h3>Doctor's Assessment</h3>
                                    
                                    <textarea id="doctorNotes" placeholder="Enter what the patient is suffering from..."></textarea>
                                </div>
                    
                                <!-- Recommendations -->
                                <div class="section">
                                    <h3>Recommendations</h3>
                                    
                                    <textarea id="recommendations" placeholder="Enter recommendations (medication, tests, follow-up)"></textarea>
                                </div>
                    
                                <!-- Report Sent By -->
                                <div class="section">
         
                                     <p><strong>Doctor to assess:</strong> Doctor ${report[0].doctor.name}</p>
                                </div>
    
                               
                                `
                                const docrecommendation=reportbody.querySelector('#recommendations')
                                const docassesment=reportbody.querySelector('#doctorNotes')
                                docassesment.placeholder = report[0]?.doctor?.assessment || docassesment.placeholder;
                                docrecommendation.placeholder = report[0]?.doctor?.recommendation || docrecommendation.placeholder;
                            }
                            await records(myhistory)
    
                            document.getElementById('report-submit').addEventListener('click',async()=>{
                                try{
                                    const patientId=patientreport[0]._id
                                    const reportId=incomingrepo.reportId
                                    const sentdate=incomingrepo.sentdate
                                    
                                    console.log('report to complete..',reportId + 'with patientId...',patientId)
                                    const docassessment=document.getElementById('doctorNotes').value
                                    const docrecommendation=document.getElementById('recommendations').value
                                    if(!docassessment || !docrecommendation){
                                        showCustomAlert('you must fill in all the analysis and recommendation part')
                                        return
                                    }
                                    const submittedrepo=await fetch('/doctors/finishreport',{
                                        method:'POST',
                                        headers:{
                                            'Content-Type':'application/json'
                                        },
                                        body:JSON.stringify({reportId,docrecommendation,docassessment,patientId,sentdate})
                                    })
                                    const submittedreport=await submittedrepo.json()
    
                                    if (submittedreport.success==true){
                                        showCustomAlert(submittedreport.message)
                                        document.getElementById('reportModal').style.display='none'
                                    }else{
                                        showCustomAlert(submittedreport.error)
                                    }
    
    
                                }catch(e){
                                    console.log('error in finishing report..',e)
                                }
                            })
    
                        })
                        infodiv.appendChild(viewreport)
    
                        patientdiv.appendChild(infodiv)
                        reports.appendChild(patientdiv)
    
    
                }))
            }
        })

        document.getElementById('pendingrepocount').textContent=pendingcount




    }catch(e){
        console.error('errror in fetching all reports',e)
    }
}

function selectTab(clickedTab, functionName) {
    // Get the parent container of the clicked tab
    const parentContainer = clickedTab.parentElement;

    // Find all appointment tabs within the same parent container
    const allTabs = parentContainer.querySelectorAll('.appointment-tab');

    // Remove active class from tabs within the same group
    allTabs.forEach(tab => tab.classList.remove('active'));

    // Add active class to the clicked tab
    clickedTab.classList.add('active');

    // Call the respective function if it exists
    if (window[functionName]) {
        window[functionName]();
    }
}





window.addEventListener('click',(e)=>{
    const modal=document.getElementById('reportModal')
    if(e.target===modal){
        modal.style.display='none'
        // document.body.style.overflow='auto'
    }

})

function toggleText(clickedElement) {
    // Close all other divs first
    const allDivs = document.querySelectorAll('.history-body');
    allDivs.forEach(div => {
        if (div !== clickedElement) {
            div.querySelector('.ful-text').style.display = 'none';
            div.querySelector('.intro').style.display = 'block';
        }
    });

    // Toggle the clicked div
    const fullText = clickedElement.querySelector('.ful-text');
    const intro = clickedElement.querySelector('.intro');

    if (fullText.style.display === 'none') {
        fullText.style.display = 'block';
        intro.style.display = 'none';
    } else {
        fullText.style.display = 'none';
        intro.style.display = 'block';
    }
}

async function records(myhistory){
    try{
        // const results=await thereports(reportId)
        // const reports=results.histories

        console.log(myhistory)
        const histodiv=document.querySelector('.histories')
        histodiv.innerHTML=''
        myhistory[0].histories.forEach((history)=>{
            const date=new Date(history.date).toISOString().split("T")[0]
            const summary=history.description.split(' ').slice(0, 7).join(' ')+'...'
            histodiv.innerHTML+=`
              <div class="history-body" style=" display: flex;flex-direction: column; border-bottom: 1px solid rgb(34, 33, 33);background-color: #bad2db;margin-top:2px;padding:5px" onclick="toggleText(this)">
                <div style="display: flex;">
                    <span style="align-items:center; display:flex; font-weight: 600;font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;margin:5px">
                        ${history.tittle}
                    </span>
                    <span style="margin:5px;margin-left:200px">
                         ${date}
                    </span> 
                </div>
               <div class="intro" style="margin:5px;padding:5px" >
                ${summary}
               </div>
               <div class="ful-text" style="display:none; margin:5px;padding:5px"> 
                 ${history.description}
               </div>
    
    
            </div>`


        })

    }catch(e){
        console.error('error in getting the reports..',e)
    }
}

async function appointmentstatus(reqdecision,patient){
    try{
        const cancelaccept=await fetch('/doctors/acceptcancel',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({reqdecision,patient})
        
        })
        const results=await cancelaccept.json()
        if(results.success){

            showCustomAlert(results.message)
        }else{
            showCustomAlert(results.error)
        }
    

    }catch(e){
        console.log('error in cancelling/acceepting request..',e)
        showCustomAlert('errror to cancel / accept reques..')
    }

}
function allappoints(){
    if(patientappointment.length>0 ){
    mypatients(patientappointment)
    } else{
        const appoints=document.querySelector('.appointments')
            // appoints.innerHTML=''
            appoints.innerHTML=`<div id="no-appointment" style="display: flex; text-align: center;padding: 20px;background-color: #f8f9fa;border-radius: 10px;width: fit-content;margin: 40px auto;box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 16 16"><script xmlns=""/>
                                            <path d="M3.793 4.5l3.5 3.5-3.5 3.5.707.707 3.5-3.5 3.5 3.5.707-.707-3.5-3.5 3.5-3.5-.707-.707-3.5 3.5-3.5-3.5z" fill="gray" fill-rule="evenodd" font-family="sans-serif" font-weight="400" overflow="visible" style="line-height:normal;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;text-transform:none;text-orientation:mixed;shape-padding:0;isolation:auto;mix-blend-mode:normal" white-space="normal" color="#000000"/>
                                        <script xmlns=""/></svg>
                                        <p style="color: #555; font-size: 18px; font-weight: bold; margin-top: 10px;align-items: center;display: flex;">
                                            No Appointments 
                                        </p>
                                    </div>`

    }
}

function todayappoints() {
    try{

        const today = new Date().toISOString().split('T')[0]; // Get today's date in "YYYY-MM-DD" format
        console.log('Today:', today);
    
        // Filter appointments where the date matches today
        console.log(patientappointment)
        const todaysAppointments = patientappointment.filter(appointment =>new Date(appointment.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
         console.log("todaysAppointments...",todaysAppointments )
        if (todaysAppointments.length > 0) {
            console.log("Today's Appointments:", todaysAppointments);
            mypatients(todaysAppointments);
        } else {
            console.log('No appointments today');
            const appoints = document.querySelector('.appointments');
            appoints.innerHTML = `
                <div id="no-appointment" style="display: flex; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 10px; width: fit-content; margin: 40px auto; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 16 16">
                        <path d="M3.793 4.5l3.5 3.5-3.5 3.5.707.707 3.5-3.5 3.5 3.5.707-.707-3.5-3.5 3.5-3.5-.707-.707-3.5 3.5-3.5-3.5z" fill="gray"/>
                    </svg>
                    <p style="color: #555; font-size: 18px; font-weight: bold; margin-top: 10px; align-items: center; display: flex;">
                        No Appointments Today
                    </p>
                </div>
            `;
        }
    }catch(e){
        console.error('errror in displaying today appointments..',e)
    }
}


function upcomingappoints(){
    console.log(patientappointment)
    
    const upcomings=patientappointment.map((appointment)=>{
        if(!appointment.patients){
            return null
        }
        const upcomingpatients=appointment.patients.filter(patient=>patient.status==="accepted")
        if(upcomingpatients.length>0){
            return{
                ...appointment,
                patients:upcomingpatients
            }
        }
    
        return null;
    }).filter(appointment => appointment !== null); 

    //    console.log('upcomings',upcomings)
    //    if (Array.isArray(upcomings) && upcomings.length === 0) {
    //        // appoints.appendChild(document.getElementById('no-appointment'))
           
    //     }
        console.log('upcomings..',upcomings)
        if(upcomings.length>0){
            const totalPatients = upcomings.reduce((sum, appointment) => {
                return sum + (appointment.patients ? appointment.patients.length : 0);
            }, 0);
            
            console.log("Total Patients:", totalPatients);
            document.getElementById('upcomingappoints').textContent=totalPatients
            mypatients(upcomings)
        }else{
            console.log('no appointment')
            const appoints=document.querySelector('.appointments')
            // appoints.innerHTML=''
            appoints.innerHTML=`<div id="no-appointment" style="display: flex; text-align: center;padding: 20px;background-color: #f8f9fa;border-radius: 10px;width: fit-content;margin: 40px auto;box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 16 16"><script xmlns=""/>
                                            <path d="M3.793 4.5l3.5 3.5-3.5 3.5.707.707 3.5-3.5 3.5 3.5.707-.707-3.5-3.5 3.5-3.5-.707-.707-3.5 3.5-3.5-3.5z" fill="gray" fill-rule="evenodd" font-family="sans-serif" font-weight="400" overflow="visible" style="line-height:normal;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;text-transform:none;text-orientation:mixed;shape-padding:0;isolation:auto;mix-blend-mode:normal" white-space="normal" color="#000000"/>
                                        <script xmlns=""/></svg>
                                        <p style="color: #555; font-size: 18px; font-weight: bold; margin-top: 10px;align-items: center;display: flex;">
                                            No Upcoming Appointments 
                                        </p>
                                    </div>`
       }
    


}

// function pendingappoints(){
//     console.log(patientappointment)
//     const pendings=patientappointment.map((appointment)=>{
//         if(!appointment.patients){
//             return null
//         }
//         const pendingpatients=appointment.patients.filter(patient=>patient.status==="pending")
//         if(pendingpatients.length>0){
//             return{
//                 ...appointment,
//                 patients:pendingpatients
//             }
//         }
        
//         return null
//     }).filter(appointment => appointment !== null); 


//     console.log('pendings..',pendings)

//     if(pendings.length>0){
//         mypatients(pendings)
//     }else{
//         console.log('no appointment')
//         const appoints=document.querySelector('.appointments')
//         // appoints.innerHTML=''
//         appoints.innerHTML=`<div id="no-appointment" style="display: flex; text-align: center;padding: 20px;background-color: #f8f9fa;border-radius: 10px;width: fit-content;margin: 40px auto;box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
//                                     <svg xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" viewBox="0 0 16 16"><script xmlns=""/>
//                                         <path d="M3.793 4.5l3.5 3.5-3.5 3.5.707.707 3.5-3.5 3.5 3.5.707-.707-3.5-3.5 3.5-3.5-.707-.707-3.5 3.5-3.5-3.5z" fill="gray" fill-rule="evenodd" font-family="sans-serif" font-weight="400" overflow="visible" style="line-height:normal;font-variant-ligatures:normal;font-variant-position:normal;font-variant-caps:normal;font-variant-numeric:normal;font-variant-alternates:normal;font-feature-settings:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;text-transform:none;text-orientation:mixed;shape-padding:0;isolation:auto;mix-blend-mode:normal" white-space="normal" color="#000000"/>
//                                     <script xmlns=""/></svg>
//                                     <p style="color: #555; font-size: 18px; font-weight: bold; margin-top: 10px;align-items: center;display: flex;">
//                                         No Pending appointments 
//                                     </p>
//                                 </div>`
//    }




// }


function mypatients(patientappointment){
    try{
        console.log('enteres')
        const appoints=document.querySelector('.appointments')
        appoints.innerHTML=''
        if (!patientappointment || !Array.isArray(patientappointment)) {
            console.log("patientappointment is undefined or not an array");
            return;
        }
        else{

            console.log('patient reports',patientappointment)
            patientappointment.forEach((appointmentdate)=>{
                   const today=new Date().toISOString().split('T')[0]
                    const mydate=new Date(appointmentdate.date)
                    
                    console.log(appointmentdate.date)
                    const formatmydate=mydate.toLocaleDateString("en-US",{day:"numeric" ,month:"short"})
    
                    if(appointmentdate.patients){
                        console.log('patients around')
                        console.log(appointmentdate.patients)
                        if(appointmentdate.patients.length==0){
                            document.getElementById('no-appointment').style.display='flex'
                            return
                        }
                        appointmentdate.patients.forEach((patient)=>{
                            
                            console.log('names',patient.name)
                            const abbrevs=patient.name.trim().split(" ")[0][0].toUpperCase()+patient.name.trim().split(" ")[1][0].toUpperCase()
                            console.log(abbrevs)
                            const patientdiv=document.createElement('div')
                            patientdiv.classList.add('patient-container')
                            const backgrimage=document.createElement('div')
                            backgrimage.classList.add('profile')
                            if(patient.image){
                                backgrimage.classList.remove('no-image')
                                backgrimage.textContent=""
                                backgrimage.style.backgroundImage=`url(${patient.image})`
        
                            }else{
                                backgrimage.classList.add('no-image')
                                backgrimage.textContent=abbrevs
                            }
                            patientdiv.appendChild(backgrimage)
        
                            const infodiv=document.createElement('div')
                            infodiv.style.display='flex'
                            infodiv.style.gap="100px"
        
                            const detcontainer=document.createElement('span')
                            detcontainer.style.display='flex'
                            detcontainer.style.flexDirection='column'
                            detcontainer.style.margin='5px'
                            detcontainer.style.marginLeft='20px'
        
                            const patientname=document.createElement('span')
                            patientname.style.fontWeight='600'
                            patientname.style.fontSize='15px'
                            patientname.textContent=patient.name
                            detcontainer.appendChild(patientname)
        
                            const reason=document.createElement('span')
                            reason.style.marginTop='5px'
                            reason.style.fontSize='14px'
                            reason.style.color="rgb(114, 107, 113)"
                            reason.textContent=patient.type 
                            detcontainer.appendChild(reason)
        
                            const dates=document.createElement('span')
                            dates.style.fontSize='13px'
                            dates.textContent=formatmydate+': at '+patient.session
                            detcontainer.appendChild(dates)
                            infodiv.appendChild(detcontainer)
                            
                              
                            const svgcontainer=document.createElement('div')
                            svgcontainer.classList.add('svg-class')
                            // if(patient.status=='pending'){
                            //     const fsvg=document.createElement('div')
                            //     fsvg.classList.add('acceptappointment');


                            //     fsvg.style.cursor='pointer'
                            //     fsvg.innerHTML=`   <svg xmlns="http://www.w3.org/2000/svg" fill="rgb(82,150,196)" width="25px" height="25px" viewBox="0 0 24 24"><script xmlns=""/>
                            //                                 <defs>
                            //                                   <style>
                            //                                     .cls-1 {
                            //                                       fill-rule: evenodd;
                            //                                     }
                            //                                   </style>
                            //                                 </defs>
                            //                                 <path id="accept" class="cls-1" d="M1008,120a12,12,0,1,1,12-12A12,12,0,0,1,1008,120Zm0-22a10,10,0,1,0,10,10A10,10,0,0,0,1008,98Zm-0.08,14.333a0.819,0.819,0,0,1-.22.391,0.892,0.892,0,0,1-.72.259,0.913,0.913,0,0,1-.94-0.655l-2.82-2.818a0.9,0.9,0,0,1,1.27-1.271l2.18,2.184,4.46-7.907a1,1,0,0,1,1.38-.385,1.051,1.051,0,0,1,.36,1.417Z" transform="translate(-996 -96)"/>
                            //                               <script xmlns=""/></svg>`
                              
                            //      svgcontainer.appendChild(fsvg)
                            //      const secsvg=document.createElement('div')
                            //      secsvg.classList.add('cancelappointment');
                            //      secsvg.style.cursor='pointer'
                            //      secsvg.innerHTML=`  <svg xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 1024 1024" fill="rgb(255, 0, 234)" class="icon" version="1.1"><script xmlns=""/><path d="M332 663.2c-9.6 9.6-9.6 25.6 0 35.2s25.6 9.6 35.2 0l349.6-356c9.6-9.6 9.6-25.6 0-35.2s-25.6-9.6-35.2 0L332 663.2z" fill=""/><path d="M681.6 698.4c9.6 9.6 25.6 9.6 35.2 0s9.6-25.6 0-35.2L367.2 307.2c-9.6-9.6-25.6-9.6-35.2 0s-9.6 25.6 0 35.2l349.6 356z" fill=""/><path d="M516.8 1014.4c-277.6 0-503.2-225.6-503.2-503.2S239.2 7.2 516.8 7.2s503.2 225.6 503.2 503.2-225.6 504-503.2 504z m0-959.2c-251.2 0-455.2 204.8-455.2 456s204 455.2 455.2 455.2 455.2-204 455.2-455.2-204-456-455.2-456z" fill=""/><script xmlns=""/>
                            //                             </svg>`
    
                            //       secsvg.addEventListener('click',async()=>{
                            //         const reqdecision={
                            //             status:'cancelled',
                            //             date:appointmentdate.date
                            //         }
                            //         await appointmentstatus(reqdecision,patient)
                                    
                            //     })
                            //     svgcontainer.appendChild(secsvg)
                            // } else
                            //  if(patient.status=='cancelled'){
                            //     const cancelsvg=document.createElement('div')
                            //     cancelsvg.innerHTML=`   <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" height="30px" width="30px" version="1.1" id="Capa_1" viewBox="0 0 283.194 283.194" xml:space="preserve"><script xmlns=""/>
                            //     <g>
                            //         <path d="M141.597,32.222c-60.31,0-109.375,49.065-109.375,109.375s49.065,109.375,109.375,109.375s109.375-49.065,109.375-109.375   S201.907,32.222,141.597,32.222z M50.222,141.597c0-50.385,40.991-91.375,91.375-91.375c22.268,0,42.697,8.01,58.567,21.296   L71.517,200.164C58.232,184.293,50.222,163.865,50.222,141.597z M141.597,232.972c-21.648,0-41.558-7.572-57.232-20.2   L212.772,84.366c12.628,15.674,20.2,35.583,20.2,57.231C232.972,191.982,191.981,232.972,141.597,232.972z"/>
                            //         <path d="M141.597,0C63.52,0,0,63.52,0,141.597s63.52,141.597,141.597,141.597s141.597-63.52,141.597-141.597S219.674,0,141.597,0z    M141.597,265.194C73.445,265.194,18,209.749,18,141.597S73.445,18,141.597,18s123.597,55.445,123.597,123.597   S209.749,265.194,141.597,265.194z"/>
                            //     </g>
                            //     <script xmlns=""/></svg>`   
                            //     svgcontainer.appendChild(cancelsvg)
    
                            //     const secsvg=document.createElement('div')
                            //     secsvg.style.color='red'
                            //     secsvg.innerHTML='Cancelled'
    
                            //     svgcontainer.appendChild(secsvg)
    
    
                            // }else
                             if(patient.status=='accepted'){
                                const acceptedsvg=document.createElement('div')
                                acceptedsvg.classList.add('completeappointment')
                                acceptedsvg.innerHTML=`   <svg xmlns="http://www.w3.org/2000/svg" fill="#32CD32" width="27px" height="27px" viewBox="0 0 24 24" id="d9090658-f907-4d85-8bc1-743b70378e93" data-name="Livello 1"><script xmlns=""/><title>prime</title><path id="70fa6808-131f-4233-9c3a-fc089fd0c1c4" data-name="done circle" d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0ZM11.52,17L6,12.79l1.83-2.37L11.14,13l4.51-5.08,2.24,2Z"/><script xmlns=""/></svg>
                            `   
                                svgcontainer.appendChild(acceptedsvg)

                                // const accept=document.createElement('div')
                                // accept.style.cursor='pointer'
                                // accept.style.color='blue'
                                // accept.innerHTML='complete '
    
                                acceptedsvg.addEventListener('click',async()=>{
                                    const today=new Date().toISOString().split('T')[0]
    
                                    if (new Date(appointmentdate.date) > new Date(today)) {
                                        showCustomAlert('Appointment date is not yet.');
                                        return
                                    }
    
                                    const reqdecision={
                                        status:'completed',
                                        date:appointmentdate.date
                                    }
                                    console.log('setting appointment complete...',reqdecision + ' ',patient)
                                    await appointmentstatus(reqdecision,patient)
                                })
                                // svgcontainer.appendChild(accept)
                            }else{
                                const secsvg=document.createElement('div')
                                secsvg.style.color='green'
                                secsvg.innerHTML='Completed'
    
                                svgcontainer.appendChild(secsvg)
                            }
    
                            infodiv.appendChild(svgcontainer)
                            patientdiv.appendChild(infodiv)
                            appoints.appendChild(patientdiv)
        
        
                                
        
                        })
                    }
    
    
    
    
                })  
                
         
           console.log(events)
        }

        document.querySelectorAll('.acceptappointment').forEach((accept,index)=>{
            accept.addEventListener('click',async()=>{
                const patient=patientappointment[index]
                console.log(patient)

                const reqdecision={
                    status:'accepted',
                    date:patientappointment[index][0].date
                }
                console.log(reqdecision.date)
                await appointmentstatus(reqdecision,patient)

            })
        })

        document.querySelectorAll('.cancelappointment').forEach((cancel,index)=>{
            cancel.addEventListener('click',async()=>{
                const patient=patientappointment[index][0].patients

                const reqdecision={
                    status:'cancelled',
                    date:patientappointment[index][0].date
                }
                await appointmentstatus(reqdecision,patient)

            })
        })
    }catch(e){
        console.error('error in getting my patients..',e)
    }
}



document.querySelectorAll('.session-checkbox').forEach(radio => {
    radio.addEventListener('change', function() {
        localStorage.setItem("meetsession", this.value);
    });
});


let  settime=[]
addtime.addEventListener('click',()=>{
    const noofvisit=parseInt(document.getElementById('numPatients').value,10)
    const sesstime=document.getElementById('session-time').value
    if(!noofvisit || !sesstime){
        const setdatealert=document.getElementById('bookdoc')
            const notificationmessage = `Add time first`;
            const notifmessage=document.createElement('div')
            notifmessage.classList.add('notification-message')
            notifmessage.innerHTML=notificationmessage
            setdatealert.appendChild(notifmessage)

            
            setInterval(() => {
               notifmessage.remove()
            }, 5000);
            return
    }
     // Ensure we only push the time up to the number of visits
     if (settime.length <  noofvisit) {
        settime.push(sesstime);

        const setdatealert=document.getElementById('bookdoc')
        const notificationmessage = `added succesfully `;
        const notifmessage=document.createElement('div')
        notifmessage.classList.add('notification-message')
        notifmessage.innerHTML=notificationmessage
        setdatealert.insertBefore(notifmessage,setdatebutton)

        
        setInterval(() => {
           notifmessage.remove()
        }, 2000);
        document.getElementById('session-time').value=''
        console.log(settime)
    } else {
        showCustomAlert("You've already added the required number of times.");
    }

 
})


setdatebutton.addEventListener('click',async()=>{
    try{
        const session=localStorage.getItem('meetsession')
        console.log('session chosen...',session)
        const noofvisit=document.getElementById('numPatients').value
        console.log('number of visits',noofvisit)
        console.log('date clicked..',clickeddate)
        // if(!session || !noofvisit  || settime.length < 1 ){
        //     const setdatealert=document.getElementById('bookdoc')
        //     const notificationmessage = `Fill all the inputs  `;
        //     const notifmessage=document.createElement('div')
        //     notifmessage.classList.add('notification-message')
        //     notifmessage.innerHTML=notificationmessage
        //     setdatealert.appendChild(notifmessage)

            
        //     setInterval(() => {
        //        notifmessage.remove()
        //     }, 5000);
        //     return
        // }   
        const meetdetails={
            date:clickeddate,
            mysessions:session,
            numvisits:noofvisit,
            appointmenttime:settime,
            bookedtime:[]
        }
        console.log('setdate button clicked....')
        await fetch('/doctors/setdate',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(meetdetails)
        }).then(res=>res.json())
        .then(data=>{
                console.log(data)
                clickeddate=''
                if(data.message){
                    showCustomAlert(data.message)
                }
                data.modifiedCount>0?showCustomAlert('appointment session set successfully'):showCustomAlert('appointment date not set, please reset')
        }
                
        )

    }catch(e){
        console.error('error in setting date ',e)
    }

})

