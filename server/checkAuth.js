const jwt = require('jsonwebtoken');
const checkAuth = (req, res, next) => { //check token for API routes
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "secret");
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Auth failed'
    });
  }
}
const checkWebToken = (req, res, next) => { //check token for web
  try {
    const token = req.headers.authorization.split(" ")[1];
    req.userData = jwt.verify(token, "secret");
    next();
  } catch (error) {
    return res.redirect('/Web');
  }
}
var checkSession = (req, res, next) => { //check session
  if(!req.session.userID || !req.cookies.user_id || !req.session.views) {
    res.redirect('/Web');
    return;
  } else {
    next();
  }
};
module.exports = {
  checkAuth,
  checkWebToken,
  checkSession
}