var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var mongoose = require('mongoose');
var SubscribeList = require('../model/SubscribeList');
var SensorData = require('../model/sensor');
var UserData = require('../model/user');
var testData = require('../model/test');
const {searchAllSensor} = require('../controllers/sensor');
const {findUserID} = require('../controllers/user');
const {searchSubList_withSubName,notificationList,updateSubList_PreviousMatchCondition,findSubscribeBefore} = require('../controllers/SubscribeList');
var ObjectId = require('mongodb').ObjectID;
var testing = (callback) => {
  return callback("123");
};

// var date = moment().hour(0).minute(0).second(0);
// console.log(date);
// date = moment(date).utc().format();
// console.log(date);
// console.log(moment(date).hour(12));
// console.log(moment(date).subtract(1,'days'));
// console.log(moment(date).hour(12).subtract(1,'days'));





// function findUserByName(name){
//   return new Promise ((resolve, reject) => {
//     UserData.findOne({name:name})
//       .select("_id")
//       .exec()
//       .then(result => {
//         if(!result)
//         {
//           reject("nothing found");
//           return;
//         }
//         resolve(result);
//       })
//       .catch(err => {
//         console.log(err);
//         reject(err.message);
//       });
//   });
// }
// async function findUser(nameA,nameB){
//   let result1 = await findUserID(nameA);
//   let result2 = await findUserID(nameB);
//   console.log(result1);
//   console.log(result2);
// }
// findUser("Ada","cheaw");
// router.get('/', (req, res) => {
//   notificationList("5b826519aed5edf0b112bde6",15,(results) => {
//     if(results)
//     {
//       res.json(results);
//       //console.log(results);
//       return;
//     }
//     res.json();
//   });
//
//   //console.log(req.body);
// });
// var id = [ObjectId('5c020741eebf871ea8bfbeec'),ObjectId('5c0211c3ce3317472fb810b8')]
// updateSubList_PreviousMatchCondition(id,false);

// module.exports = router;
