var express = require('express');
var router = express.Router();
const Utils = require('./utils/getData');
var sessionChecker = (req, res, next) => {
  if (!req.session.userID || !req.cookies.user_id || !req.session.views) {
    res.render('login');
    return;
  }
  else {
    next();
  }
};
//main page
router.get('/', sessionChecker, Utils.MainPage);

//handle sensor Info page
router.get('/:sensorId', sessionChecker, Utils.GetSensorInfo);

//handle ajax call for HistoryData
router.post('/getHistoryData', Utils.GetHistoryData);

//handle user login
router.post('/submit', Utils.UserLogin);

//handle ajax call for user subscribe
router.post('/subscribe', Utils.Subscribe);

//handle ajax call for user subscribe multiple sensor
router.post('/subscribeMany', Utils.SubscribeMany);


module.exports = router;
