var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var mongoose = require('mongoose');
// var SubscribeList = require('../model/SubscribeList');
// var {aggregatedConditions} = require('../server/utils/aggregatedConditions');
// var SensorData = require('../model/sensor');
// var UserData = require('../model/user');
// var SubscriptionLog = require('../model/subscriptionLogs')
// var testData = require('../model/test');
// const {searchAllSensor} = require('../controllers/sensor');
// const {findUserID} = require('../controllers/user');
// const {searchSubList_withSubName,notificationList,updateSubList_PreviousMatchCondition,findSubscribeBefore} = require('../controllers/SubscribeList');
var ObjectId = require('mongodb').ObjectID;
// var testing = (callback) => {
//   return callback("123");
// };
//
// SubscriptionLog.aggregate( [ { $group : { _id : "$_subscription" } } ] )
//   .exec().then(results => {
//     console.log(results);
//   });

// SubscribeList.find({_sensorID:ObjectId('5bb468b805713b20a538d270')})
//   .select('condition')
//   .then(results =>{
//     var allConditions = []
//     results.forEach(result => {//merge multiple array of object into one array
//       if(result.condition && result.condition.length) {
//         allConditions = allConditions.concat(...result.condition);
//       }
//     });
//     console.log(allConditions);
//     let preConditions = [
//     {
//       type:"max",
//       value:null
//     },
//     {
//       type:"min",
//       value:null
//     }];
//     console.log(aggregatedConditions(preConditions,allConditions));
//   })
//   .catch(err => {
//     console.log(err);
//   })






// module.exports = router;
