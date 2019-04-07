const express = require('express');
const router = express.Router();
const subscriptionController = require('../../../controller/API/subscription');
const subscriptionLogController = require('../../../controller/API/subscriptionLog');
const { checkAuth } = require('../../../server/checkAuth');


// url : {...}/API/subscription
//handle API call for user get all related subscription
router.get('/', checkAuth, subscriptionController.GetAllSubscription);

// url : {...}/API/subscription/{id}
//handle ajax call for getting subscription info like condition , option ...
router.get('/:id', checkAuth, subscriptionController.GetSubscriptionInfo);

// url : {...}/API/subscription/subscribe
//handle ajax call for user subscribe one or multiple sensor
router.post('/subscribe', checkAuth, subscriptionController.SubscribeMany);

// url : {...}/API/subscription/unsubscribe
//handle ajax call for user unsubscribe a subscription
router.post('/unsubscribe', checkAuth, subscriptionController.Unsubscribe);

// url : {...}/API/subscription/updateSubscriptionInfo
//handle ajax call for update Subscription Info
router.post('/updateSubscriptionInfo', checkAuth, subscriptionController.UpdateSubscriptionInfo);

// url : {...}/API/subscription/getSubscriptionInfo
//handle ajax call for getting subscription logs
router.post('/getSubscriptionLogs', checkAuth, subscriptionLogController.GetSubscriptionLogs);


module.exports = router;