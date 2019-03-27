var express = require('express');
var router = express.Router();
const SensorController = require('../../controller/API/sensor');


//received register request from sensor
router.post('/insert', SensorController.SensorRegister);
//receive a notification request from sensor
router.post('/update', SensorController.SensorUpdated);

module.exports = router;
