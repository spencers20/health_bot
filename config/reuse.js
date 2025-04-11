const Groq=require('groq-sdk')
function generatemyid(myname){
    let letters;
    const randomnumber=Math.floor(Math.random()*1e10).toString()
    const number=randomnumber.slice(0,6)
    console.log('random number generated...',number)

    const name=myname.trim().split(" ") //split name to an array
    if (name.length<2){
        letters=name[0][0].toUpperCase()+name[0][2].toUpperCase()
    }else{
        letters=name[0][0].toUpperCase()+name[1][0].toUpperCase()
    }

    const myid=letters+number
    console.log('geneeratesd id..',myid)
    return myid
}
async function querymodel(instruction){
    const  groq = new Groq({api_key:process.env.GROQ_API_KEY})
    try{

        const chatCompletions=await groq.chat.completions.create({
            messages :[
                {
                    role:"user",
                    content: instruction
                }
            ],
            model:"llama-3.3-70b-versatile",
            temperature:1,
        })
        console.log(`chatCompletions: ${chatCompletions}`)

        const summary=chatCompletions.choices[0]?.message?.content || "No summary found"

        return summary
    } catch(e){
        console.log(`error in generating summaries ${e}`)
    }


}

module.exports={querymodel,generatemyid}
