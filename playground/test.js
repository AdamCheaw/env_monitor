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
// var userName = "cheaw";
// var sensorIDArray = [ObjectId("5b9390b05c74d041e2f2ecaa"),ObjectId("5b8264ef8f83e53b726fdeda"),ObjectId("5b8264ef8f83e53b726fdedb"),ObjectId("5b8264ef8f83e53b726fdedc")];
// var subscription = [{
//     _sensorID: "5ba7394a3405d424dad7d5ad",
//     name: "asfsd",
//     option: "advanced",
//     condition: [
//         {
//             "type" : "max",
//             "value" : "30"
//         },
//         {
//             "type" : "min",
//             "value" : "30"
//         }
//     ]
//   },
//   {
//       _sensorID: "5b9390b05c74d041e2f2ecaa",
//       name: "ddddd",
//       option: "default",
//       condition: []
//     }
// ];
//
// findExist(userName,subscription)//find exist subscription
//   .then(exist => {
//     console.log("exist : "+exist);
//     findUserID(userName)//find user ID
//       .then(userID => {
//         if(!userID)
//         {
//           console.log("did not found userID");
//           throw new Error("did not found userID");
//         }
//         //subscribe new
//         return subscribeMany(userName,userID,subscription);
//       })
//       .then(result => {
//         if(result) {
//           console.log("subscribeMany : "+result);
//           //unsubscribe previous exist subscription
//           return unsubscribeMany(userName,exist);
//         }
//       })
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//
//   })
//   .catch(err => {
//     console.log(err);
//   });
// unsubscribeMany(userName,sensorIDArray)
//   .then(result => {
//     console.log(result);
//     return findUserID(userName);
//   })
//   .then(userID => {
//     if(!userID)
//     {
//       console.log("did not found userID");
//       throw new Error("did not found userID");
//     }
//     return subscribeMany(userName,userID,subscription);
//   })
//   .then(result => {
//     console.log("subscribeMany : "+result);
//   })
//   .catch(err => {
//     console.log(err);
//   });

// function getUser(username) {
//     return UserData.findOne({name: username})
//       .then(function(user) {
//           return user;
//       })
//       .catch(function(err) {
//         //console.log(err);
//         return err;
//       });
// }
// function doSomething(input) {
//   return input._id;
// }
// getUser('cheaw').then(function(result) {
//
//   return doSomething(result);
//   console.log("result : "+result);
// })
// .then((result2) => {
//   console.log("result2 : "+result2);
// });


// router.post('/', (req, res, next) => {
//   res.json({msg:"ok"});
//   console.log(req.body);
//
//
// });

module.exports = router;
