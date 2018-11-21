var SensorData = require('../model/sensor');
var UserData = require('../model/user');
var SubscribeListData = require('../model/SubscribeList');
var mongoose = require('mongoose');
var express = require('express');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
const {convertCondition} = require('../server/utils/convert');
// find all subscriber subscribe this sensor
var searchSubscribeList_withSensorID = (sensorID,callback) => {
  //console.log("DB : "+sensorID);
  SubscribeListData.find({ _sensorID:ObjectId(sensorID) })
    // .populate({
    //   path:'_sensorID',
    //   match: {_id:ObjectId(sensorID)},
    //   select:' ',
    // })
    .populate({
      path:'_subscriber',
      match:{onConnect:true},
      select:'socketID'
    })
    .select('_subscriber option condition')
    .exec()
    .then(docs => {
      if(docs){
        console.log(docs);
        var items = [];
        //find the current onConnect subscriber
        docs.forEach(item => {
          if(item._subscriber){//if !null push to the items
            var doc = {
              socketID : item._subscriber.socketID,
              option : item.option,
              condition : item.condition
            };
            items.push(doc);
            //console.log("items.push(item._subscriber.socketID)"+item._subscriber.socketID);
          }
        });
        callback(items,sensorID);
        return;
        //console.log("data: "+docs);
      }
      else {
        //callback(null);
        return;
      }
    })
    .catch(err => {
      console.log(err);
      return err
    });
}

var searchSubList_withSubName = (name, callback) => {
  var doc;
  SubscribeListData.find({subscriberName:name})
    .populate({
      path:'_sensorID',
      select:'_id name temp date onConnect type'
    })
    .select('subscriberName option condition')
    .exec()
    .then(docs => {
      if(docs && docs.length){
        var result = [];
        docs.forEach(doc => {
          if(doc._sensorID._id) {
            var item = {
               _id: doc._id,
               _sensorID: {
                 _id: doc._sensorID._id,
                 name: doc._sensorID.name,
                 temp: doc._sensorID.temp,
                 date: moment.parseZone(doc._sensorID.date).local().format('YYYY MMM Do, h:mm:ssa'),
                 onConnect: doc._sensorID.onConnect,
                 type: doc._sensorID.type
               },
               subscriberName: doc.subscriberName,
               option: doc.option,
               condition: doc.condition
            };
            result.push(item);
          }
        })

        callback(result);
        //console.log("searchSubscribeList_withSubscriberName: "+docs);
        return;

      }
      else {
        callback(null);
        return;
      }
    })
    .catch(err => {
      console.log(err);
      return err
    });
    // if(doc)
    // {
    //   return doc;
    // }
}

var subscribeOne = (name,userID,sensorID,option,condition,callback) => {
  SubscribeListData.findOne({
      _subscriber : mongoose.Types.ObjectId(userID),
      _sensorID : mongoose.Types.ObjectId(sensorID),
      subscriberName : name
    },(err,doc) => {
      if (!doc) { //nothing found , insert a new document
        var item = {
          _subscriber : mongoose.Types.ObjectId(userID),
          _sensorID : mongoose.Types.ObjectId(sensorID),
          subscriberName : name,
          option:option,
          condition : condition
        };
        var data = new SubscribeListData(item);
        data.save()
        .then(result => {
          if(result) {
            console.log("DB : subscribe success");

            callback(result);
          }
        })
        .catch(err => {
          console.log(err);
          callback("error");
        });
      }
      else {//already insert before
        doc.option = option;
        doc.condition = condition;
        doc.save()
        .then(result => {
          if(result) {
            console.log("DB : subscribe success");

            callback(result);
          }
        })
        .catch(err => {
          console.log(err);
          callback("error");
        });


      }
    });
    return;
}


var unsubscribeOne = (subscribeListID,callback) => {
  SubscribeListData.remove({_id:ObjectId(subscribeListID)}, (err) => {
    if (err) return callback(err);
    return callback("success");
    console.log('the subdocs were removed');
  });
}
//no callback style
var subscribeMany = (name,userID,subscription) => {
  var insertData = subscription.map(doc => {
    return {
      option: doc.option,
      _subscriber : userID,
      _sensorID : ObjectId(doc._sensorID),
      subscriberName : name,
      condition: convertCondition(doc.condition)
    };
  });
  return new Promise((resolve, reject) => {
    SubscribeListData.insertMany(insertData,(err,result) => {
      if(err)
      {
        reject(err);
      }
      resolve(result);
    });
  })
  // return SubscribeListData.insertMany(insertData,(err,result) => {
  //   return new Promise((resolve, reject) => {
  //     if(err)
  //     {
  //       reject(err);
  //     }
  //     resolve(result);
  //   })
  //
  // });
}
var unsubscribeMany = (userName,sensorID) => {
  return SubscribeListData.deleteMany({
    subscriberName:userName,
    _id: {$in:sensorID}
  }).exec();
}
//find the sensor already subscribe by user before
var findExist = (userName,subscription) => {
  sensorIDArray = subscription.map(doc => ObjectId(doc._sensorID));
  return SubscribeListData.find({
    subscriberName:userName,
    _sensorID: {$in:sensorIDArray}
  }).select("_id").exec();
}
// update the subscribeList 's previous value
// for the next time can compare new value with this previous value
var updateSubList_PreviousValue = (idArray,newValue) => {
  console.log(idArray);
  SubscribeListData.updateMany(
    { _id: {$in:idArray} },
    { $set: { previousValue : newValue } },
    { multi:true }, (err,res) => {
      if(err) {
        console.log(err);
      }
      else {
        console.log(`DB: updateSubList_PreviousValue to newValue : ${newValue}`);
      }
    });
}

//generate the notificationList to user when a sensor notifify a new value
var notificationList = (sensorID,currentValue,callback) => {
  SubscribeListData.find({ _sensorID: ObjectId(sensorID) })
  .populate({
    path:'_subscriber',
    select:'_id socketID onConnect'
  })
  .select('_id _subscriber option condition previousValue')
  .exec((err,results) => {
    var data = [];
    if(err) {
      console.log(err);
      return;
    }
    else {
      results.forEach(result => {
        var doc = {};
        if(result.option == "default") {
          doc = {
            _id: result._id,
            socketID : result._subscriber.socketID,
            onConnect : result._subscriber.onConnect,
            option : result.option,
            condition : result.condition
          };

        }
        else if(result.option == "advanced")
        {
          var match = false;
          //var match = result.condition.some()
          for(var i = 0;i < result.condition.length;i++)
          {
            var type = result.condition[i].type;
            if(result.condition[i].value) {
              var conditionValue = result.condition[i].value;
            }
            else if(result.condition[i].minValue && result.condition[i].maxValue) {
              var conditionValue = {
                minValue : result.condition[i].minValue,
                maxValue : result.condition[i].maxValue,
              }
            }


            if( type == "max" && (currentValue > conditionValue || result.previousValue > conditionValue) ) {
              match = true;
              break;
            }
            else if( type == "min" && (currentValue < conditionValue || result.previousValue < conditionValue) ) {
              match = true;
              break;
            }
            else if( type == "precision" ) {
              match = true;
              break;
            }
            else if( type == "equal" && (currentValue == conditionValue || result.previousValue == conditionValue)) {
              match = true;
              break;
            }
            else if(
              type == "between" &&
              ((currentValue > conditionValue.minValue &&
                currentValue < conditionValue.maxValue) ||
                (result.previousValue > conditionValue.minValue &&
                  result.previousValue < conditionValue.maxValue)
              )
            ) {
              match = true;
              break;
            }

          }
          if(match)
          {
            doc = {
              _id: result._id,
              socketID : result._subscriber.socketID,
              onConnect : result._subscriber.onConnect,
              option : result.option,
              condition : result.condition
            };
          }
        }
        if(doc._id)
        {
          data.push(doc);
        }

      });
      //console.log(data);
      return callback(data);

    }
  });
}
module.exports = {
  searchSubscribeList_withSensorID,
  searchSubList_withSubName,
  subscribeOne,
  subscribeMany,
  unsubscribeOne,
  unsubscribeMany,
  notificationList,
  findExist,
  updateSubList_PreviousValue
};
