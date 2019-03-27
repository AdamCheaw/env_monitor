const express = require('express');
const router = express.Router();
const subscriptionController = require('../../../controller/API/subscription');
const subscriptionLogController = require('../../../controller/API/subscriptionLog');


// router.get('/', sensor);

// url : {...}/API/subscription/subscribe
//handle ajax call for user subscribe one or multiple sensor
router.post('/subscribe', subscriptionController.SubscribeMany);

// url : {...}/API/subscription/unsubscribe
//handle ajax call for user unsubscribe a subscription
router.post('/unsubscribe', subscriptionController.Unsubscribe);

// url : {...}/API/subscription/getSubscriptionInfo
//handle ajax call for getting subscription info like condition , option ...
router.post('/getSubscriptionInfo', subscriptionController.GetSubscriptionInfo);

// url : {...}/API/subscription/updateSubscriptionInfo
//handle ajax call for update Subscription Info
router.post('/updateSubscriptionInfo', subscriptionController.UpdateSubscriptionInfo);

// url : {...}/API/subscription/getSubscriptionInfo
//handle ajax call for getting subscription logs
router.post('/getSubscriptionLogs',subscriptionLogController.GetSubscriptionLogs);

module.exports = router;
