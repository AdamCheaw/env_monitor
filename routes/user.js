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


module.exports = router;
