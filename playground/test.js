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
router.get('/', (req, res) => {
  res.render('test/test');
  //console.log(req.body);
});


module.exports = router;
