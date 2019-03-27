const express = require('express');
const router = express.Router();
const sensorHistoryController = require('../../../controller/API/sensorHistory');


// router.get('/', sensor);

// url : {...}/API/sensor/getHistory
//handle ajax call for HistoryData
router.post('/getHistoryData', sensorHistoryController.GetHistoryData);


module.exports = router;
