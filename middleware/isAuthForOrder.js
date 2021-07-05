const isAuthForOrder = async (req, res, next) => {
    if (!req.session || (!req.session.isLogin && !req.session.sUser))
        return res.status(200).redirect("/signin");
    
    next();
}

module.exports = isAuthForOrder;