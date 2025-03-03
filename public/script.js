const searchbtn=document.getElementById('searchbtn')
const responsearea=document.querySelector('.response') 
const textarea=document.querySelector('.outertextarea')


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



searchbtn.addEventListener('click',async()=>{
    try{

        console.log('search button clicked...')
        const question=textarea.value
        console.log('question...',question)
        responsearea.innerHTML=`
          <span> Generating </span>
          <span class="dot">.</span>
          <span class="dot">.</span>
          <span class="dot">.</span>
        `
        const dot=document.querySelectorAll('.dot')
        Array.from(dot).forEach(dt=>{
            dt.classList.add('fadedot')
        })
        responsearea.style.display='block'
    
        const response=await fetch('/askgroq',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({message:question})
            
        })

    
        if (response){
            console.log('response..',response)
            const res=await response.json()

            console.log('type of res..',typeof res)
            const formattedresponse=formatTextToHTML(res)
            setTimeout(()=>{
                responsearea.innerHTML=formattedresponse
            },3000)
            
        }
    }catch(e){
        console.log('error in answering questions...',e)
    }


})