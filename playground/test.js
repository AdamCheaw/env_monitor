var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var SubscribeList = require('../model/SubscribeList');
var SensorData = require('../model/sensor');
var UserData = require('../model/user');
const {searchAllSensor} = require('../controllers/sensor');
const {findUserID} = require('../controllers/user');
const {searchSubList_withSubName,unsubscribeMany,subscribeMany,findExist} = require('../controllers/SubscribeList');
var ObjectId = require('mongodb').ObjectID;
var testing = (callback) => {
  return callback("123");
};


// router.get('/', (req, res) => {
//   res.render('test/test');
//   //console.log(req.body);
// });
// var data = [
//     {
//       _id : ObjectId("5be5380a2bb77833fe53e2b7"),
//       name : "sensor1",
//       value : 28.6,
//       date: ISODate("2018-11-09T07:32:26.689Z"),
//       _sensorID : ObjectId("5b8264ef8f83e53b726fdeda"),
//       __v: 0
//     },
//     {
//       _id : ObjectId("5be538122bb77833fe53e2b8"),
//       name : "sensor1",
//       value : 28.5,
//       date : ISODate("2018-11-09T07:32:34.969Z"),
//       _sensorID: ObjectId("5b8264ef8f83e53b726fdeda"),
//       __v : 0
//     },
//     {
//       _id : ObjectId("5be538192bb77833fe53e2b9"),
//       name : "sensor1",
//       value : 28.6,
//       date : ISODate("2018-11-09T07:32:41.252Z"),
//       _sensorID : ObjectId("5b8264ef8f83e53b726fdeda"),
//       __v : 0
//     }
// ]
// var results = [];
// var currentTime = moment()
// var left = moment(currentTime).minutes() % 5;
// var startOfTime = moment(currentTime).subtract(1, 'hours').subtract(left,'minutes');
// var endOfTime = moment(currentTime).subtract(left,'minutes');
//
// var endInInterval = moment(startOfTime).add(5, 'minutes');
// for(let i = 0;i < 12;i++) {
//   results.push({
//     value : null,
//     date : endInInterval
//   })
//   endInInterval = moment(endInInterval).add(5, 'minutes');
// }
// endInInterval = moment(startOfTime).add(5, 'minutes');
// while(startOfTime <= endOfTime)
// {
//   if(data[0].date > startOfTime && data[0].date <= endInInterval)
//   {
//     sum += data[0].value;
//     count += 1;
//     data.splice(0,1);
//   }
//
// }
// data.forEach(doc => {
//   let min = (moment(doc.date).minutes)/5;
//   let hour = (moment(doc.date).hours)-(moment.(currentTime).hours);
//   if(hour > 0)
//   {
//     results[min+left]
//   }
// });
// console.log(results);
//

module.exports = router;
