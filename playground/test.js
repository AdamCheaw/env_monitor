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
const {searchSubList_withSubName,unsubscribeMany,subscribeMany,findExist} = require('../controllers/SubscribeList');
var ObjectId = require('mongodb').ObjectID;
var testing = (callback) => {
  return callback("123");
};
// var subscribeSensor = ['5bb468b805713b20a538d270','5bb468b805713b20a538d272','5bb468b805713b20a538d274'];
// var sensors = subscribeSensor.map(thisSensor => {
//   return ObjectId(thisSensor);
// });
//
// //console.log(sensors);
//
//insert subscription with multiple sensor(array)
// var docs = {
//   _subscriber: ObjectId("5be932206f077213223c9f73"),
//   _sensors: ObjectId('5bb468b805713b20a538d270'),
//   subscriberName: "cheaw"
// }
// testData.insertMany(docs, (err,result) => {
//   if(err) {
//     console.log(err);
//     return;
//   }
//   console.log(result);
//   return;
// });

//find the _sensors and populate _sensors
testData.find({
    _sensors: ObjectId("5bb468b805713b20a538d270")
  })
  .populate('_sensors')
  .exec()
  .then(result => {
    if(result) {
      //console.log(result[0]);
      var docs = result.map(doc => {
        return {
          _id : doc._id,
          subscriberName : doc.subscriberName,
          _sensors : doc._sensors.map(thisSensor => ObjectId(thisSensor._id)),
          option: doc.option
        }
      });
      console.log(docs);
    }
  })
  .catch(err => {
    if(err) {
      console.log(err);
    }
  });

//$pull:remove a single element in an array, $push:push a single element in an array
// testData.updateOne(
//   {_id: ObjectId("5bfe2dd906f54055fd5b32b8")},
//   { $pull: { _sensors:ObjectId("5bb468b805713b20a538d270") } }
// )
//   .exec()
//   .then(result => {
//     if(result) {
//       console.log(result);
//     }
//   })
//   .catch(err => {
//     console.log(err);
//   })

// remove _sensors is empty
// testData.remove(
//   {_sensors: []}
// )
//   .exec()
//   .then(result => {
//     if(result) {
//       console.log(result);
//     }
//   })
//   .catch(err => {
//     console.log(err);
//   })

//use mongoose .save()
// var item = {
//   _subscriber : mongoose.Types.ObjectId("5b8e318aa2ff00543c752903"),
//   _sensors : mongoose.Types.ObjectId("5bb468b805713b20a538d270"),
//   subscriberName : "Adam",
// };
// var data = new testData(item);
// data.save()
// .then(result => {
//   if(result) {
//     console.log("DB : subscribe success");
//
//     console.log(result);
//   }
// })
// .catch(err => {
//   console.log(err);
// });

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
// router.post('/', (req, res) => {
//   res.json({msg:"hihi"});
//   console.log(req.body);
//   //console.log(req.body);
// });


//module.exports = router;
