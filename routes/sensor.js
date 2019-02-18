var express = require('express');
var router = express.Router();
const Utils = require('./utils/sensor');


//received register request from sensor
router.post('/insert', Utils.SensorRegister);
//receive a notification request from sensor
router.post('/update', Utils.SensorUpdated);

module.exports = router;
