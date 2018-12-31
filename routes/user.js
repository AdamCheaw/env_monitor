var express = require('express');
var router = express.Router();
const Utils = require('./utils/getData');

//main page
router.get('/', Utils.MainPage);

//handle sensor Info page
router.get('/:sensorId', Utils.GetSensorInfo);

//handle ajax call for HistoryData
router.post('/getHistoryData', Utils.GetHistoryData);

//handle user login
router.post('/submit', Utils.UserSubmit);

//handle ajax call for user subscribe
router.post('/subscribe', Utils.Subscribe);

//handle ajax call for user subscribe multiple sensor
router.post('/subscribeMany', Utils.SubscribeMany);

//handle ajax call for user unsubscribe a subscription
router.post('/unsubscribe', Utils.Unsubscribe);

//handle ajax call for getting subscription info like condition , option ...
router.post('/getSubscriptionInfo', Utils.GetSubscriptionInfo);

//handle ajax call for update Subscription Info
router.post('/updateSubscriptionInfo', Utils.UpdateSubscriptionInfo);
module.exports = router;
