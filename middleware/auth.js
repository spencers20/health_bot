function isAuthenticated(req,res,next){
    if (req.isAuthenticated){
        next()
    } else{
        res.status(401).send('user not authenticated')
    }
}

module.exports= isAuthenticated 