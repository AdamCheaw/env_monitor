var express = require('express');
var router = express.Router();
const Utils = require('./utils/observe');

//GET user request real-time observe page
router.get('/', Utils.ObserverPage);

//handle ajax call for user unsubscribe a subscription
router.post('/unsubscribe', Utils.Unsubscribe);

//handle ajax call for getting subscription info like condition , option ...
router.post('/getSubscriptionInfo', Utils.GetSubscriptionInfo);

//handle ajax call for update Subscription Info
router.post('/updateSubscriptionInfo', Utils.UpdateSubscriptionInfo);

module.exports = router;
