const authenticatedAfterLogin = async (req, res, next) => {
    if (req.session.isLogin)
        return res.status(200).redirect("/404");
        
    next();
}

module.exports = authenticatedAfterLogin;