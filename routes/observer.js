var express = require('express');
var router = express.Router();
const Utils = require('./utils/observe');
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
router.get('/', sessionChecker, Utils.ObserverPage);

//handle ajax call for user unsubscribe a subscription
router.post('/unsubscribe', Utils.Unsubscribe);

//handle ajax call for getting subscription info like condition , option ...
router.post('/getSubscriptionInfo', Utils.GetSubscriptionInfo);

//handle ajax call for update Subscription Info
router.post('/updateSubscriptionInfo', Utils.UpdateSubscriptionInfo);

//GET user request subscriptionLogs page
router.get('/viewLog', sessionChecker, Utils.ViewLogsPage);

//handle ajax call for getting subscription logs
router.post('/getSubscriptionLogs',Utils.GetSubscriptionLogs);
// router.post('/getSubscriptionLogs', (req, res, next) => {
//   console.log(req.body);
//   res.json({msg:"ok"});
// });


module.exports = router;
