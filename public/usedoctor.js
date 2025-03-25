

const pagecalendar=document.getElementById('mycalendar')
const docscalendar=document.getElementById('docscalendar')
const doccard=document.querySelector('.main-doc')
const book=document.getElementById('booking')
const allreportscard=document.querySelector('.all-reports')
let clickeddate;
let doctor;
let myreports;
let mydocId=''
let alldoctors


// let allreports
document.addEventListener('DOMContentLoaded',async()=>{
    initializeCalendar(pagecalendar)
    myreports=await allrepos()
    console.log(Array.isArray(myreports))
    console.log('myreports',myreports)
    const doctors=await fetch('/docs')
    alldoctors= await doctors.json() 
    console.log('existing report Id,',localStorage.getItem('repid'))
    activedocs()
    completereports()
   
   
    const sidestyle=document.querySelector('.side-menu')
    if(sidestyle){

        console.log(window.getComputedStyle(sidestyle).display); // Check if it’s 'none'
    }

  
})

async function allrepos() {
    localStorage.removeItem('myreports')
    let myrepos
    const reports=await fetch('/user/reportnow')
    myrepos=await reports.json()
    console.log(Array.isArray(myrepos))
    console.log(myrepos)
    if(!myrepos || myrepos.length===0){
        myrepos=[]
    }
    localStorage.setItem('myreports',JSON.stringify(myrepos))
    return myrepos  
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


   
function getreports(reportId){
    try{
        console.log('report id...',reportId)
        let myreport
        myreport=JSON.parse(localStorage.getItem('myreports'))
        console.log('myreports  ..getreports',myreport)
        if(!myreport){
          myreport=[]
        }
  
       const requiredreport = Array.isArray(myreport) && myreport.length > 0 && myreport[0]?.reports
        ? myreport[0].reports.find(report => report.reportId === reportId) || []
        : [];

       console.log("requiredreport....",requiredreport)
       return requiredreport
    }catch(e){
        console.error('error in getting the required report',e)
    }
}

function showreport(myreports,reports,docname){
    try{
        const modalbody=document.querySelector('.modal-body')
        modalbody.innerHTML=''
        if(Object.keys(reports).length>0){
           
            const age = myreports?.[0]?.birthdate ? getage(myreports[0].birthdate) : "";
            const diseases = reports?.Diagnosis?.length > 0 ? formatTextToHTML(reports.Diagnosis[0].summary) : "";
           

            const fulldiagnosis= reports?.Diagnosis?.length>0?formatTextToHTML(reports.Diagnosis[0].result):'No full report'
            let Nursename=reports?.nurse?reports.nurse.name:'N/A'
            const username=myreports?.[0]?.name?myreports[0].name:"" 
            const usergender=myreports?.[0]?.gender?myreports[0].gender:""
            let doctorasses
            let doctorrecomend
            if(reports.status=='pending'){
                doctorasses=''
                doctorrecomend=''
                nurseases=reports?.nurse?reports.nurse.assesment:''
            }else{
                doctorasses=reports.doctor.assessment
                doctorrecomend=reports.doctor.recommendation
                nurseases=reports.nurse.assesment
            }

           
            modalbody.innerHTML=`
                  <!-- Patient Info -->
                    <div class="section">
                        <h3 style="align-self: center;display: flex;justify-content: center;align-items: center;">Patient Report</h3>
                        <p><strong>Name:</strong>${username} </p>
                        <p><strong>Age:</strong> ${age}</p>
                        <p><strong>Gender:</strong> ${usergender}</p>
                    </div>
        
                    <!-- Metrics -->
                    <div class="section">
                        <h3>Most Recent Metrics</h3>
                        <ul>
                            <li><strong>Temperature:</strong> ${reports.metrics.temperature}&deg;C</li>
                            <li><strong>Blood Pressure:</strong> ${reports.metrics.bloodPressure.systolic}/${reports.metrics.bloodPressure.diastolic}mmHg</li>
                            <li><strong>Respiratory Rate:</strong> ${reports.metrics.respiratoryRate} breaths/min</li>
                            <li><strong>Pulse Rate:</strong> ${reports.metrics.pulseRate} bpm</li>
                        </ul>
                    </div>
        
                    <!-- First Diagnosis -->
                    <div class="section">
                        <h3>Symptoms Diagnosis</h3>
                        <p><strong>Symptoms:</strong> ${reports.Diagnosis[0].symptoms}</p>
                        <p style="margin-top:6px"><strong>Possible Condition:</strong> ${diseases}</p>
                        <p style="margin-top:6px ; cursor:pointer" id='togglereason'><strong>Reason for chosen condition:</strong> </p>
                        <span style="margin-top:6px; display:none;flex-direction:column" id="fullreason"> ${fulldiagnosis}</span>
                    </div>
        
                    <!-- Nurse's Assessment -->
                    <div class="section">
                        <h3>Nurse Assesment</h3>
                         <p id="nurseAssesment">${nurseases} </p>
                        <textarea  id="nurseNotes" placeholder="Enter any vital signs, initial observations, and any immediate concerns...."></textarea>
                    </div>
                    <div class="docs-part" style="flex-direction:column">
                    <div class="section">
                    <h3>Doctor's Assessment</h3>
                    <p id="doctorNotes" >${doctorasses}</p>
                </div>
                <!-- Recommendations -->
                <div class="section">
                    <h3>Recommendations</h3>
                    
                    <p id="recommendations" >${doctorrecomend}</p>
                </div>
                 </div>
                    

                    <!-- Report Sent By -->
                    <div class="section" id="docnurse">
                        <p><strong>Report Sent By:</strong>${Nursename}</p>
                        <p id="reposent"><strong>Report Sent To:</strong> Dr. ${docname}</p>
                        <p id="repoasses"><strong>Report Assesed :</strong> Dr. ${docname}</p>
                    </div>
            `
            if (reports.status=='complete'){
                document.getElementById('nurseNotes').style.display='none'
                document.getElementById('reposent').style.display='none'
                document.getElementById('nurseAssesment').style.display='flex'
                document.querySelector('.docs-part').style.display='flex'
                senddocbtn.style.display='none'
                document.querySelector('.modal-footer').innerHTML = `
                <span style="font-weight: bold; color: green;">Report completed and assessed</span>
                <button id="downloadrepo" style="margin-left: 50px;align-self:center; padding: 5px 10px; background-color: blue; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Download Report
                </button>
              `;

              document.getElementById('downloadrepo').addEventListener('click',async()=>{
                console.log('downloading report...')
                const reportId=reports.reportId
                console.log('report id to be downloaded...',reportId)
                await fetch('/user/generaterepo',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({reportId})

                })

              })
              
            


            }else{
                document.getElementById('nurseNotes').style.display='flex'
                document.getElementById('nurseAssesment').style.display='none'
                document.getElementById('repoasses').style.display='none'
                document.querySelector('.docs-part').style.display='none'
                document.querySelector('.modal-footer').innerHTML ='<button class="send-doc" >Submit</button>'

                const senddocbtn=document.querySelector('.send-doc')
                senddocbtn.addEventListener('click',async()=>{
                    const docId=localStorage.getItem('mydocId')
                    console.log('docId..',docId)
                    if(!docId){
                        alert('no doctor receiving report, Pick one')
                        return
                    }
                    await sendreport(docId)
                })

            }
            const nursenotes=modalbody.querySelector('#nurseNotes')
            nursenotes.placeholder = reports?.nurse?.assesment || nursenotes.placeholder;
            
        }else{
            console.log('no report ', typeof reports)
            document.querySelector('.modal-content').style.display='none'
        }

    }catch(e){
        console.error('errror in showing the reports..',e)
    }
}

function completereports(){
    try{
        document.getElementById('completerepos').classList.add('clicked-docs')
        document.getElementById('pendingrepor').classList.remove('clicked-docs')

        const completeones=myreports.map(report=>{
            const completed=report.reports.filter(repo=>repo.status=='complete')
            if(completed.length>0){
                return{
                    ...report,
                    reports:completed
                }
             
            }
            return null
        }).filter(report=>report!==null)

        console.log('completed reports',completeones)
        if (completeones.length>0){
            displayreports(completeones)
        }else{
            const allreportscard=document.querySelector('.all-reports')
           allreportscard.innerHTML=''
           allreportscard.innerHTML=`<div style="text-align: center;padding: 20px;background-color: #f8f9fa;border-radius: 10px;width: fit-content;margin: 40px auto;box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">       
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
        console.error('error in getting all complete reports..',e)
    }
}

// changed allreports
function Pendingreports(){
    try{
        document.getElementById('completerepos').classList.remove('clicked-docs')
        document.getElementById('pendingrepor').classList.add('clicked-docs')
        const Pendingrepos=myreports.map(report=>{
            const pending=report.reports.filter(repo=>repo.status=='pending')
            if(pending.length>0){
                return{
                    ...report,
                    reports:pending
                }
             
            }
            return null
        }).filter(report=>report!==null)

        console.log('completed reports',Pendingrepos)
        if (Pendingrepos.length>0){
            displayreports(Pendingrepos)
        }else{
            const allreportscard = document.querySelector('.all-reports');
            allreportscard.innerHTML = `
                <div style="text-align: center;padding: 20px;background-color: #f8f9fa;border-radius: 10px;width: fit-content;margin: 40px auto;box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">       
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 32 32" style="display: block; margin: 0 auto; opacity: 0.7;">
                        <g>
                            <g>
                                <path d="M21.5,14.75c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75 S21.09,14.75,21.5,14.75z" fill="#263238"/>
                                <path d="M10.5,14.75c0.41,0,0.75,0.34,0.75,0.75s-0.34,0.75-0.75,0.75s-0.75-0.34-0.75-0.75 S10.09,14.75,10.5,14.75z" fill="#263238"/>
                            </g>
                            <g>
                                <polyline fill="none" points="21.5,1.5 4.5,1.5 4.5,30.5 27.5,30.5 27.5,7.5" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                                <polyline fill="none" points="21.5,1.5 27.479,7.5 21.5,7.5 21.5,4" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                                <path d="M14.5,18.5c0-0.83,0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5" fill="none" stroke="#455A64" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"/>
                            </g>
                        </g>
                    </svg>
                    <p style="color: #555; font-size: 18px; font-weight: bold; margin-top: 10px;">
                        No Pending Reports 
                    </p>
                </div>
            `;
            
        }

    }catch(e){
        console.error('error in getting all pending reports..',e)
    }
}

function displayreports(repos){
    let reportId
    const allreportscard=document.querySelector('.all-reports')
    allreportscard.innerHTML=''
    console.log('repors...',repos)
    if (repos.message){
        allreportscard.innerHTML='No report found'
        return 
    }
  
    repos[0].reports.forEach((report)=>{
        // reportId=report.reportId
        // conso
    const docname=report?.doctor?report.doctor.name:"report not sent to doctor"
    const datetime=new Date(report.reportId).toISOString().split("T")[0]
   

    allreportscard.innerHTML+=`  
     <div class="report-card" style="padding: 10px; box-shadow: none; background-color: rgb(229, 231, 231); border-bottom: 1px dotted rgb(44, 1, 1); border-radius: 0; display: flex; align-items: center; gap: 10px;">
     <!-- SVG Report Icon -->
     <div style="width: 40px; height: 40px;">
         <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="rgb(3, 26, 88)" version="1.1" viewBox="0 0 490 490" xml:space="preserve">
             <g>
                 <g>
                     <g>
                         <path d="M430,20h-95V10c0-5.523-4.477-10-10-10H165c-5.523,0-10,4.477-10,10v10H60c-5.523,0-10,4.478-10,10v450 
                                 c0,5.522,4.477,10,10,10h370c5.523,0,10-4.478,10-10V30C440,24.478,435.523,20,430,20z M165,70h140V50H175V20h140v40 
                                 c0,5.522,4.477,10,10,10h15v15H150V70H165z M140,105h210c5.523,0,10-4.478,10-10v-5h20v340H110V90h20v5 
                                 C130,100.522,134.477,105,140,105z M420,470H70V40h85v10h-5c-11.028,0-20,8.972-20,20h-30c-5.523,0-10,4.478-10,10v360 
                                 c0,5.522,4.477,10,10,10h290c5.523,0,10-4.478,10-10V80c0-5.522-4.477-10-10-10h-30c0-11.028-8.972-20-20-20h-5V40h85V470z"/>
                         <rect x="175" y="145" width="180" height="20"/>
                         <rect x="135" y="185" width="220" height="20"/>
                         <rect x="135" y="345" width="220" height="20"/>
                         <rect x="135" y="385" width="165" height="20"/>
                         <rect x="245" y="225" width="110" height="20"/>
                         <rect x="245" y="265" width="110" height="20"/>
                         <rect x="245" y="305" width="110" height="20"/>
                         <path d="M145,325h75c5.523,0,10-4.478,10-10v-85c0-5.523-4.477-10-10-10h-75c-5.523,0-10,4.477-10,10v85 
                                 C135,320.522,139.477,325,145,325z M155,240h55v65h-55V240z"/>
                     </g>
                 </g>
             </g>
         </svg>
     </div>
     <!-- Report Details -->
     <div style="display: flex; flex-direction: column; flex-grow: 1; ">
 
         <div style="font-size: 14px;">
             Nurse: <span style="  font-weight: bold;color: black;">${report.nurse.name}</span>
         </div>
 
         
         <!-- Show Doctor's Name only if the report is complete -->
         <div style="font-size: 14px;  display:flex;">
             Doctor: <span style="font-weight: bold;color: rgb(3, 88, 81);">${docname}</span>
         </div>
         <div id="repostatus" style=" font-size: 12px; color: rgb(255, 51, 0);">
             ${report.status}
         </div>
         
     </div>
 
     <!-- Date & Report Link -->
     <div style="display: flex; flex-direction: column; align-items: center;">
         <div style="font-size: 14px; color: gray;">${datetime} </div>
         <div class="viewrepo" doc-name="${docname}" repo-id="${report.reportId}" style="margin-top:3px; font-size: 14px; color: rgb(0, 47, 255);  cursor: pointer;text-decoration:underline">
            view report
         </div>
        </div>
 
      </div>`
    if(report.status=='complete'){
    document.getElementById('repostatus').style.color='green'
      }else{
    document.getElementById('repostatus').style.color='red'
     }
     
    })
    
    document.querySelectorAll('.viewrepo').forEach((view)=>{
        view.addEventListener('click',()=>{

           const reportid=view.getAttribute('repo-id')
           const docname=view.getAttribute('doc-name')
           console.log('report id...',reportid)
           const reports=getreports(reportid)
           console.log('myreport..',reports)
           showreport(myreports,reports,docname)
           document.getElementById('sendreport').style.display='flex'
           document.querySelector('.the-doc').style.display='none'
           document.querySelector('.calendar').style.display='none'
           document.querySelector('.sendtodoc').style.display='none'
           document.querySelector('.doc-details').style.alignItems='center'
           document.querySelector('.doc-details').style.justifyContent='center'
           document.querySelector('.doc-details').style.display='flex'
    
        })
    })


   
}


function getage(birthdate){
    const today=new Date().getTime()
    const dob=new Date(birthdate).getTime()

    const ageinmili=today-dob
    age=new Date(ageinmili).getUTCFullYear()-1970
    console.log(`age in milis\n ${ageinmili} other age  ${age+1970}`)
    return age
}

 
function initializeCalendar(calendarEl, events = [], onDateClick = null) {
    if (!calendarEl) {
        console.error('Calendar element not provided');
        return;
    }
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        dateClick: (info) => {
            if (onDateClick && typeof onDateClick === 'function') {
                try {
                    onDateClick(info);
                } catch (e) {
                    console.error('Error in date selection:', e);
                }
            }
        },
        events: events,
        height: 'auto',
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: ''
        }
    });
    
    setTimeout(() => {
        calendar.render();
        calendar.updateSize();
    }, 100);
   
    
    return calendar;
}


function activedocs(){
    try{

        document.getElementById('activedocs').classList.add('clicked-docs')
        document.getElementById('alldocs').classList.remove('clicked-docs')
        const activedoctors=alldoctors.filter(doc=>doc.status=='active')
        console.log('active doctors...',activedoctors)
        dochistory(activedoctors)

    }catch(e){
        console.error('error in gettin all active doctors..',e)
    }
}

function everydoc(){
    document.getElementById('activedocs').classList.remove('clicked-docs')
    document.getElementById('alldocs').classList.add('clicked-docs')
    dochistory(alldoctors)

}


async function getdocevents(docId) {
    try{
        if(!docId){
            console.log('docId not defined')
            return
        }
        const appoinmentdates=await fetch('/user/getdocdates',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({docId})
        })
        if(appoinmentdates){
            console.log(`the document is ${typeof appoinmentdates} \n ${appoinmentdates}  `)
            results= await appoinmentdates.json()
            console.log(results.allevents)
            if(!Array.isArray(results.allevents)){
                console.log(`the document is ${typeof results} and not an array  `)
                // events=[results.allevents]
            }else{
                console.log('it is an array')
             
                // events=results.allevents
            }
            const events={
                event:results.allevents,
                time:results.timeevent
            }
            return results
        }else{
            console.log("no dates yet")
          
        }
    }catch(e){
        console.error('error in fetching doc events ',e)
    }
}
    

function togglebookdoc(doc){
    try{
        const bookReport=document.querySelector('.doc-details')
        document.body.style.overflow='hidden'
        const thedoc=document.querySelector('.the-doc')
        bookReport.style.display='flex'
        if (thedoc.style.display !=='flex'){
            thedoc.style.display ='flex'
        }
        thedoc.innerHTML=''
        const nametype=document.createElement('span')
        nametype.classList.add('name-type')
        const thename=document.createElement('span')
        thename.style.fontSize="19px"
        thename.style.fontFamily=" 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        const docsname=doc.name
        console.log('docsname',docsname)
        thename.textContent='DOCTOR  '+docsname.toUpperCase()
        nametype.appendChild(thename)
        const thetype=document.createElement('span')
        thetype.style.fontSize='16px'
        thetype.style.marginTop='10px'
        thetype.style.fontWeight='600'
        thetype.textContent=doc.speciality
        nametype.appendChild(thetype)
        thedoc.appendChild(nametype)

        const thepic=document.createElement('div')
        thepic.classList.add('doc-detail-image')
        thepic.style.backgroundImage=`url(${doc.image})`
        thedoc.appendChild(thepic)

    }catch(e){
        console.log('error in togglin doc',e)
    }
}

function dochistory(doctors){
     try{
        const doccontainer=document.querySelector('.doc-card')
        const doclist=document.querySelector('.doctor-list')
        doclist.innerHTML=''
        doctors.forEach((doc)=>{

            const doccard=document.createElement('div')
            doccard.classList.add('main-doc')
            const profile=document.createElement('div')
            profile.classList.add('doc-profile')
            profile.style.backgroundImage=`url(${doc.image})`
            doccard.appendChild(profile)

            const docdetails=document.createElement('div')
            docdetails.style.display='flex'
            docdetails.style.flexDirection='column'
            docdetails.style.marginLeft='30px'

            const docname=document.createElement('div')
            docname.style.fontSize='17px'
            docname.style.fontFamily="'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
            docname.innerHTML='Dr. '+doc.name
            docdetails.appendChild(docname)

            const doctype=document.createElement('div')
            doctype.classList.add('doc-type')
            doctype.innerHTML=doc.speciality
            docdetails.appendChild(doctype)

            const docdescription=document.createElement('div')
            docdescription.classList.add('doc-description')
            docdescription.innerHTML=doc.description
            docdetails.appendChild(docdescription)

            const docfooter=document.createElement('div')
            docfooter.classList.add('doc-lower')
            const docstatus=document.createElement('div')
            docstatus.style.fontSize='16px'
            doc.status==='active'?docstatus.style.color='rgb(32, 99, 5)':docstatus.style.color='rgb(163, 73, 46)'
            docstatus.innerHTML=doc.status
            docfooter.appendChild(docstatus)

            if(doc.status=='active'){
                const sendrepo=document.createElement('div')
                sendrepo.classList.add('send-book')
                sendrepo.innerHTML='Send Report'
                sendrepo.addEventListener('click',()=>{
                    mydocId=localStorage.getItem('mydocId')
                    if(mydocId){
                        localStorage.removeItem('mydocId')
                        mydocId=""
                        mydocId=doc._id
                    }else{
                        mydocId=doc._id
                    }
                    localStorage.setItem('mydocId',doc._id)
                    console.log('doctor id chosen...',mydocId)
                    const reportid= "2025-03-24T09:09:46.508Z"
                    const reports = getreports(reportid);
                    console.log('reports..',reports)
    
                    const docname=reports.doctor?reports.doctor.name:doc.name
    
                     showreport(myreports,reports,docname)
                     
                    // senddocbtn.addEventListener('click',async()=>{
                    //     await sendreport(mydocId)
                    // })
                    function openreason() {
                        console.log('entered')
                        const reasonelem = document.getElementById("fullreason");
                        if (reasonelem.style.display==='none') {
                            reasonelem.style.display='flex'
                        } else {
                            reasonelem.style.display='none'
                            // console.error("Element with ID 'reasonelem' not found!");
                        }
                    }
                   
                    docscalendar.style.display='none'
                    document.getElementById('sendreport').style.display='flex'
                    // document.getElementById('bookdoc').style.display='none'
                    togglebookdoc(doc)
                })
                docfooter.appendChild(sendrepo)
            }

            const bookdoc=document.createElement('div')
            bookdoc.classList.add('send-book')
            bookdoc.style.width='70px'
            bookdoc.style.alignItems='center'
            bookdoc.style.justifyContent='center'
            bookdoc.style.display='flex'
            bookdoc.innerHTML='Book '
            bookdoc.addEventListener('click',async()=>{
        
                doctor=doc
                localStorage.clear('selectedTime')
                localStorage.clear('clickeddate')

                const events=await getdocevents(doc._id)

                async function ondateclick(info){
                    try{
                        const clickeddate=new Date(info.dateStr).toISOString().split('T')[0]
                        const datetoday=new Date().toISOString().split('T')[0]
                        if(clickeddate<datetoday){  
                            alert('Please pick a future date')
                            return
                        }
                        console.log('date clicked...',clickeddate)
                        console.log(events.allevents)
                        const eventOnDate=events.allevents.find(event=>event.start.split("T")[0]===clickeddate)
                        console.log("eventOnDate...",eventOnDate)
                            if(!eventOnDate){
                                alert('The doctor is not available on this date, please check the calendar again')
                              
                                return
                            }
                            else {
                                const bookdoc = document.getElementById('bookdoc');
                                bookdoc.style.display = 'flex';
                            
                                // Remove any existing select elements before adding a new one
                                const existingSelect = bookdoc.querySelector('#timeSelect');
                                if (existingSelect) {
                                    existingSelect.remove();
                                }
                            
                                const selecttime = document.createElement('select');
                                selecttime.id = 'timeSelect'; 
                                selecttime.style.borderRadius = '3px';
                                selecttime.style.margin = '3px';
                            
                                console.log('events..', events);
                                const defaultOption = document.createElement('option');
                                defaultOption.text = 'Select Time';
                                defaultOption.disabled = true;
                                defaultOption.selected = true;
                                selecttime.appendChild(defaultOption);
                            
                                events.timeevent.forEach(timevent => {
                                    if (timevent.date === clickeddate) {
                                        console.log('timeevent.apptime', timevent.apptime);
                            
                                        timevent.apptime.forEach(time => {
                                            const option = document.createElement('option');
                                            option.value = time;
                                            option.textContent = time;
                                            selecttime.appendChild(option);
                                        });
                                    }
                                });
                            
                                selecttime.addEventListener('change', function () {
                                    const selectedTime = selecttime.value;
                                    localStorage.setItem('selectedTime', selectedTime);
                                    console.log('Selected Time:', selectedTime);
                                    alert('You selected: ' + selectedTime);
                                });
                            
                                bookdoc.insertBefore(selecttime, book);
                                localStorage.setItem('clickeddate', clickeddate);
                            }
                            
                    }catch(e){
                        console.error('error in  click date function',e)
                    }
                        
                }

                initializeCalendar(docscalendar,events.allevents,ondateclick)
                docscalendar.style.display='flex'
              
               document.getElementById('sendreport').style.display='none'
               togglebookdoc(doc)

                // document.getElementById('docscalendar').style.display='flex'
        

            })
            docfooter.appendChild(bookdoc)

            docdetails.appendChild(docfooter)
            doccard.appendChild(docdetails)
            doclist.appendChild(doccard)



        })


     }catch(e){
        console.log('errror in placing docs in their cards')
     }
}

    
async function sendreport(docId){
    try{
      
        const reports=getreports()
        const nurseassesment=reports?.nurse?.assesment?.trim()? reports.nurse.assesment:document.getElementById('nurseNotes').value
        console.log(nurseassesment)
        const repoId=localStorage.getItem('repid')

        if(docId==""){
            alert('choose doctor first')
            return
        }
        if(!nurseassesment.trim()&& !reports.nurse.assesment){
            alert('The nurse must asses first before sending report')
            return
        }

        // const [docvisit,reportupdate]=await Promise.all([
            const sentresults=await fetch('/user/sendrepo',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({repoId,nurseassesment,docId})
            })
            const sentconfirm=await sentresults.json()
            sentconfirm.message?alert(sentconfirm.message):alert(sentconfirm.error)


    
    }catch(e){
        console.error('error in sending report to doc',e)
    }

}



book.addEventListener('click',async()=>{
    try{
        // document.querySelector('.confirmation').style.display='none'
        const appoinmentreason=document.getElementById('reason').value
        const dateclicked=localStorage.getItem("clickeddate")
        setsession=localStorage.getItem('session')
        const time=localStorage.getItem('selectedTime')
        console.log('picked time,',time)
        console.log(doctor._id)
        console.log(typeof setsession)
        console.log(typeof appoinmentreason)
        const patient={
            name:'Daniel Richards',
            session:time,
            type:appoinmentreason,
            status:'pending'
        }
        const seldoctor={
            doctor:doctor._id,
            name:doctor.name,
            date:dateclicked
        }
        // const event={
        //     type: "appointment",
        //     description: ` A ${appoinmentreason} Appointment with Dr.${doctor} on ${dateclicked}   `,
        //     summary: `${appoinmentreason} appointment`,
        //     datedue: dateclicked,
        //     dateset: new Date(),
        //     status: "pending"

        // }
        const savetodoc=await fetch('/user/savetodoc',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({seldoctor,patient})
        })
        if(savetodoc){
            const saved=await savetodoc.json()
            console.log('saved...',saved)
            if(saved.success){
                console.log('saved successfully')
                document.querySelector('.confirmation').style.display='flex'
                // alert('appointment request sent successfullly')
            }else{
                console.log('error in making request')
                alert(saved.error)
            }
        }

    }catch(e){
        console.error('error in booking an appointment ',e)
    }

})


window.addEventListener('click',(e)=>{
    const bookReport=document.querySelector('.doc-details')
    if(e.target===bookReport){
        localStorage.removeItem("clickeddate")
        docscalendar.innerHTML=''
        bookReport.style.display='none'
        document.body.style.overflow='auto'
    }

})

