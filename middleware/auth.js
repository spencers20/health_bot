// Common authentication middleware
function isAuthenticated(req, res, next) {
    if ( req.session.user || req.session.doc) {
        
        return next();
    } else {
        console.log('User not authenticated...',req.session.doc);
        return res.render('index.ejs');
    }
}

module.exports= {isAuthenticated} 