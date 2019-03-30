const express = require('express');
const router = express.Router();
const MainPageController = require("../../../controller/WEB/main-page");
const SensorInfoController = require("../../../controller/WEB/historyData-page");
const LoginController = require("../../../controller/WEB/login");
const {checkSession} = require("../../../server/checkAuth");

//main page
router.get('/',checkSession,MainPageController.MainPage);

//handle sensor Info page
router.get('/:sensorId',checkSession,SensorInfoController.GetSensorInfo);

//handle user login
router.post('/login', LoginController.UserLogin);


module.exports = router;
