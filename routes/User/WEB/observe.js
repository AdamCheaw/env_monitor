var express = require('express');
var router = express.Router();
const ObserveController = require("../../../controller/WEB/observe-page");
const SubLogController = require("../../../controller/WEB/subscriptionLog-page");
var sessionChecker = (req, res, next) => {
  if (!req.session.userID || !req.cookies.user_id || !req.session.views) {
    res.render('login');
    return;
  }
  else {
    next();
  }
};
//GET user request real-time observe page
router.get('/', sessionChecker, ObserveController.ObserverPage);

//GET user request subscriptionLogs page
router.get('/viewLog', sessionChecker, SubLogController.ViewLogsPage);


module.exports = router;
