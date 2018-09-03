var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var SubscribeList = require('../model/SubscribeList');
var SensorData = require('../model/sensor');
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

/*time checkExpire*/
// function equal(sensor) {
//     return sensor.id != 222 ;
// }
// var allSensor = [];
// var sensor = {};
// sensor = {id:111,expireDate: moment().format()};
// allSensor.push(sensor);
// sensor = {id:222,expireDate: moment().add(1,'h').format()};
// allSensor.push(sensor);
//
// objIndex = allSensor.findIndex((obj) => obj.id == 222);
// allSensor[objIndex].id = 333;
// allSensor = allSensor.filter((sensor) => sensor.id != 222);
// var currentDate = moment().add(10,'s').format();
// for(var i = 0;i < allSensor.length;i++)
// {
//   if(currentDate > allSensor[i].expireDate)
//   {
//     console.log(currentDate);
//     console.log(allSensor[i]);
//     console.log("expire!!");
//   }
// }
/*********************************/
// router.get('/', (req, res, next) => {
//
//   res.send("expireDate --- "+Sensors[0]);
// })
// //
// module.exports = router;

// SubscribeList.find({subscriber:"cheaw"})
//   .populate('_sensorID')
//   .exec()
//   .then(docs => {
//     if(docs){
//       console.log("data: "+docs);
//     }
//     else {
//       console.log("nothing found");
//     }
//   })
//   .catch(err => {
//     console.log(err);
//   });
