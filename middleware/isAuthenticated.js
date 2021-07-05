const isAuthenticated = async (req, res, next) => {
    if (!req.session.isLogin)
        return res.status(200).redirect('/signin');
    
    else if (req.session.isLogin && req.session.sUser.username !== req.params.username)
        return res.status(200).redirect("/404");
    
    next();
}
module.exports = isAuthenticated;