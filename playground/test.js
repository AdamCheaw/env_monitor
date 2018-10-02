var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var SubscribeList = require('../model/SubscribeList');
var SensorData = require('../model/sensor');
const {searchAllSensor} = require('../controllers/sensor');
const {searchSubList_withSubName} = require('../controllers/SubscribeList');
var testing = (callback) => {
  return callback("123");
};
// router.get('/', (req, res, next) => {
//   res.render('test/test');
// });
router.get('/', (req, res, next) => {
  searchAllSensor((sensorData_result) =>{
    searchSubList_withSubName("Adam",(sub_result) => {
      var subscribe_sensor = sub_result.map(data => {
        return {
          sid: data._sensorID._id
        };
      });
      res.render('test/test',{SensorData:sensorData_result,subscribe_sensor:JSON.stringify(subscribe_sensor)});
    });
  });

});

module.exports = router;
//const {searchSubscribeList_withSensorID} = require('../controllers/SubscribeList');
// var myObject = {
//     message: 'Hello World!',
//     name: 'test',
//     data:[
//           { _id: '5b6a72fe8f5dd04d4eadeb78',
//             date: '2018 Aug 8th 12:35:28 pm',
//             name: 'sensor1',
//             temp: '31'
//           }
//     ]
// };
// searchSubscribeList_withSensorID('5b8264ef8f83e53b726fdeda', (result) =>{
//   if(result!= "") {
//     console.log("result: " + result);
//   }
//   else {
//     console.log("nothing");
//   }
//
// })
