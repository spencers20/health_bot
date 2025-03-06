// const { docs } = require("googleapis/build/src/apis/docs")

const signin=document.getElementById('signin')
const signup=document.getElementById('signup')
const login=document.querySelector('.sign-in')
const create=document.querySelector('.sign-up')
const ncode=document.getElementById('n-code')
const showhide=document.querySelectorAll('.showhide')
const signinbtn=document.getElementById('signin-btn')
const signupbtn=document.querySelector('.signup-btn')
const confpassword=document.getElementById('confpass')


signin.addEventListener('click',()=>{
    signin.classList.add('active')
    signup.classList.remove('active')
    login.style.display='flex'
    create.style.display='none'
                                                                                                                                                                                                                                              
}) 

signup.addEventListener('click',()=>{

    create.style.display='flex'
     login.style.display='none'
     signup.classList.add('active')
    signin.classList.remove('active')


                                                                                                                                                                                                                                                    
}) 

document.querySelectorAll('.showhide').forEach((btn) => {
    btn.addEventListener('click', () => {
        const passinput = btn.closest('.passw').querySelector('.passw-input');

        if (passinput.type === "password") {
            passinput.type = "text";
            btn.textContent = "hide";
        } else {
            passinput.type = "password";
            btn.textContent = "show";
        }
    });
});


function togglenurse(){
    console.log('toggele nurse code clicked...')
    const passinput=document.querySelector('.signinpass')
    const ncode=document.getElementById('n-code')
    if(ncode.style.display==='none' || ncode.style.display===''){
        ncode.style.display='flex'
        passinput.style.display='none'
    }else{
        ncode.style.display='none'
        passinput.style.display='flex'
    }
}

signinbtn.addEventListener('click',async(e)=>{
    try{
        e.preventDefault() 
        const signincard=e.target.closest('.sign-in')
        const idinput=signincard.querySelector('.user-name')
        const passinput=signincard.querySelector('.passw-input')

   
        const nurseId=ncode.value
        const userId=idinput.value
        if(!nurseId){
            console.log('authentication of user only')
            if(idinput && passinput){
                const userId=idinput.value
                const password=passinput.value
                if(!userId && !password){
                    alert('enter all credentials')
                }else{
                     
                    console.log(`all credentials..${userId}..${password}.`)
                    await fetch('/google/loginuser',{
                        method:'POST',
                        headers:{
                            'Content-Type':'application/json'
                        },
                        body:JSON.stringify({userId,password}),
                        credentials:'include'
                    }).then(res => res.json())
                    .then(data => {
                        console.log('data')
                        if (data.redirect) window.location.href = data.redirect;
                    });
                }
            }
        } 

        if(nurseId && userId){
            console.log('authenticatinf both nurse and user...')
            await fetch('/google/usernurse',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({userId,nurseId}),
                credentials:'include'   
            }).then(res=>res.json())
            .then(data=>{
                console.log('data  redirected..',data)
                if(data.redirect) window.location.href=data.redirect
            })
        }

    

    }catch(e){
        console.error('error in loggging in user..',e)
    }
})


confpassword.addEventListener('focus',(e)=>{
    const signup=e.target.closest('.sign-up')
    const inputpassword=signup.querySelector('.passw-input')
    const passvalue=inputpassword.value
    if(passvalue.lenght<8){
        alert('password should have 8 characters or more')
        signupbtn.setAttribute('disabled', true);
    } else {
        signupbtn.removeAttribute('disabled'); // Enable signup button
    }

})
signupbtn.addEventListener('click',async(e)=>{
    try{
        e.preventDefault()
        console.log('sign up button clicked...')
        const signup=e.target.closest('.sign-up')
        const fullname=signup.querySelector('.fname')
        const useremail=signup.querySelector('.email')
        const fpassword=signup.querySelector('#fpass')
        const confirmpass=signup.querySelector('#confpass')
        const password=confirmpass.value.trim()
        const firstpass=fpassword.value.trim()


        if(firstpass!== password){
            alert('first password should be same as the second')
            return;
        }
        else{

                const myname=fullname.value
                const mail=useremail.value.trim()
    
                // const allcredentials=Object.values(credentials).every(credential=>credential!==undefined && credential!==null && credential!=="")
                if (!mail || !myname ||  !password){
                    alert('all fields should be filled before signing up')
                }else{      
                    const credentials={
                        name:myname,
                        email:mail,
                        password:password
                    }      
                    console.log('credentials ..',credentials)
                    const createuser=await fetch('/google/createuser',{
                        method:'POST',
                        headers:{
                            'Content-Type':'application/json'
                        },
                        body:JSON.stringify({myname,mail,password})
                    })
    
                    const createduser=await createuser.json()
                    if (createduser.acknowledged){
                        alert('check your email for your ID; ')
                        signin.classList.add('active')
                        signup.classList.remove('active')
                        login.style.display='flex'
                        create.style.display='none'
                                                    
                        
                    }
        

               
            }
        }

    }catch(e){
        console.error('error in signing in..',e)
    }



})
