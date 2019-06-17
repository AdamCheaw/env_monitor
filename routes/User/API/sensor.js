const express = require('express');
const router = express.Router();
const SensorHistoryController = require('../../../controller/API/sensorHistory');
const SensorController = require('../../../controller/API/sensor');


// router.get('/', sensor);

// url : {...}/API/sensor/getHistoryData/sadas13as4sa6dsa6
//handle ajax call for HistoryData
router.post('/getHistoryData/:sensorID', SensorHistoryController.GetHistoryData);

// url : {...}/API/sensor/{id}
//API get all sensor
router.get('/:sensorID', SensorController.GetSensorByID);

// url : {...}/API/sensor/
//API get all sensor
router.get('/', SensorController.GetAllSensor);



module.exports = router;