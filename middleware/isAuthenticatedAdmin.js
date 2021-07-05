const isAuthenticatedAdmin = async (req, res, next) => {
  if (!req.session.isLogin) return res.status(200).redirect('/signin');

  if (!req.session.isLoginAdmin) return res.status(200).redirect('/signin');

  next();
};
module.exports = isAuthenticatedAdmin;
