var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var moment = require('moment');
var SubscribeList = require('../model/SubscribeList');
var SensorData = require('../model/sensor');
const {searchAllSensor} = require('../controllers/sensor');
const {searchSubList_withSubName} = require('../controllers/SubscribeList');
var ObjectId = require('mongodb').ObjectID;
var testing = (callback) => {
  return callback("123");
};
// results: { $elemMatch: { $gte: 80, $lt: 85 } }
// SubscribeList.find({
//   $and: [
//     {_sensorID:ObjectId('5b8264ef8f83e53b726fdeda')},
//     {$or : [
//       { option: "default" },
//       {
//         option: "advanced",
//         $or : [
//           {
//             condition: {
//               $elemMatch: {type:"max",value:{$gte: 29 }}
//             }
//           },
//           {
//             condition: {
//               $elemMatch: {type:"min",value:{$lt: 29 }}
//             }
//           }
//         ]
//       }
//     ]}
//   ]
// })
// .populate({
//   path:'_subscriber',
//   match:{onConnect:true},
//   select:'socketID'
// })
// // .select('_id')
// .exec((err,subscribers) =>{
//   if(err){
//     console.log(err);
//   }
//   else {
//     console.log(subscribers);
//     var items = [];
//     subscribers.forEach(item => {
//       if(item._subscriber){//if !null push to the items
//         items.push(item._subscriber.socketID);
//         //console.log("items.push(item._subscriber.socketID)"+item._subscriber.socketID);
//       }
//     });
//     console.log(items);
//   }
// });
// .then(docs => {
//   console.log(docs);
// })
// .catch(err => {
//   console.log(err);
// });

// router.post('/', (req, res, next) => {
//   res.json({msg:"ok"});
//   console.log(req.body);
//
//
// });

module.exports = router;
