var express = require('express');
var router = express.Router();
const MainPageController = require("../../../controller/WEB/main-page");
const SensorInfoController = require("../../../controller/WEB/historyData-page");
const LoginController = require("../../../controller/WEB/login");
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
router.get('/', sessionChecker, MainPageController.MainPage);

//handle sensor Info page
router.get('/:sensorId', sessionChecker, SensorInfoController.GetSensorInfo);

//handle user login
router.post('/submit', LoginController.UserLogin);


module.exports = router;
