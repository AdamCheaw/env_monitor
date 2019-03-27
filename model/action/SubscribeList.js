const SensorData = require('../schema/sensor');
const UserData = require('../schema/user');
const SubscribeListData = require('../schema/SubscribeList');
const mongoose = require('mongoose');
const express = require('express');
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');
const {convertCondition} = require('../../server/utils/convert');
const {aggregatedConditions} = require('../../server/utils/aggregatedConditions');
const {generateNotificationList} = require('../../server/utils/notificationList');
// find all subscriber subscribe this sensor
const searchSubscribeList_withSensorID = (sensorID,callback) => {
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
const findAllSubscriber_bySensorID = (sensorID) => {
  return SubscribeListData.find({ _sensorID:ObjectId(sensorID) })
    .populate({
      path:'_subscriber',
      //match:{onConnect:true},
      select:'socketID _id onConnect'
    })
    .populate({
      path:'_sensorID',
      select:'_id temp onConnect data'
    })
    .select('_id _subscriber _sensorID option condition groupType title ')
    .exec();
}

const searchSubList_withSubName = (name, callback) => {
  var doc;
  SubscribeListData.find({subscriberName:name})
    .populate({
      path:'_sensorID',
      select:'_id name temp date onConnect type'
    })
    .select('subscriberName option condition groupType title')
    .exec()
    .then(docs => {
      if(docs && docs.length){
        var result = [];
        docs.forEach(doc => {
          if(doc._sensorID && doc._sensorID.length) {
            //mapping every sensor in this subscription
            var sensors = doc._sensorID.map(thisSensor => {
              return {
                 _id: thisSensor._id,
                 name: thisSensor.name,
                 temp: thisSensor.temp,
                 date: moment.parseZone(thisSensor.date).local().format('YYYY MMM Do, h:mm:ssa'),
                 type: thisSensor.type,
                 onConnect: thisSensor.onConnect
              };
            });
            var item = {
               _id: doc._id,
               _sensorID: sensors,
               subscriberName: doc.subscriberName,
               option: doc.option,
               condition: doc.condition,
               groupType: doc.groupType,
               title: doc.title
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

const subscribeOne = (name,userID,sensorID,option,condition,callback) => {
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
const unsubscribeOne = (subscribeListID,callback) => {
  SubscribeListData.deleteOne({_id:ObjectId(subscribeListID)}, (err) => {
    if (err) return callback(err);
    return callback("success");
    console.log('the subdocs were removed');
  });
}

const unsubscribeOneSensor = (sensorID,subscribeListID) => {
  return new Promise((resolve, reject) => {
    SubscribeListData.updateOne(
      {_id: ObjectId(subscribeListID)},
      { $pull: { _sensors:ObjectId(sensorID) } }
    )
      .exec()
      .then(() => {
        return SubscribeListData.deleteMany( {_sensorID:[]} ).exec();
      })
      .then(() => {
        resolve("success");
      })
      .catch(err => {
        if(err) {
          console.log(err);
          reject(err.message);
        }
      });
  });

}

//no callback style
const subscribeMany = (name,userID,subscription) => {
  var insertData = subscription.map(doc => {
    return {
      option: doc.option,
      _subscriber : userID,
      _sensorID : doc._sensorID.map(sensorID => ObjectId(sensorID)),
      subscriberName : name,
      condition: convertCondition(doc.condition),
      groupType: (typeof doc.groupType === 'undefined') ? null : doc.groupType,
      title: doc.title
      //the title is user defined  or sensor name ,it depend on groupType
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

}
const unsubscribeMany = (userName,sensorID) => {
  return SubscribeListData.deleteMany({
    subscriberName:userName,
    _id: {$in:sensorID}
  }).exec();
}
//find the sensor already subscribe by user before
const findSubscribeBefore = (userName,subscription) => {
  var sensorIDArray = [];
  subscription.forEach(doc => {
    doc._sensorID.forEach(sensorID => {
      sensorIDArray.push(ObjectId(sensorID));
    });
  });
  return SubscribeListData.find({
    subscriberName:userName,
    _sensorID: { $in:sensorIDArray }
  }).select("_id").exec();
}
// update the subscribeList 's previous value
// for the next time can compare new value with this previous value
const updateSubList_PreviousValue = (idArray,newValue) => {
  //console.log(idArray);
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

const updateSubList_PreviousMatchCondition = (idArray,isMatch) => {
  if(idArray && idArray.length) {
    SubscribeListData.updateMany(
      { _id: {$in:idArray} },
      { $set: { previousMatch : isMatch} },
      { multi:true }, (err,res) => {
        if(err) {
          console.log(err);
        }
        else {
          console.log(`DB: update matching flag`);
        }
      });
  }
}

//generate the notificationList to user when a sensor notifify a new value
const notificationList = (sensorData,callback) => {
  SubscribeListData.find({ _sensorID: ObjectId(sensorData._id) })
  .populate({
    path:'_sensorID',
    select:'_id name temp date onConnect'
  })
  .populate({
    path:'_subscriber',
    select:'_id socketID onConnect'
  })
  .select('_id _subscriber _sensorID option title condition previousValue groupType previousMatch')
  .exec((err,results) => {

    if(err) {
      console.log(err);
      return;
    }
    else {
      let currentData = {
        sensorName: sensorData.name,
        value: sensorData.temp
      };
      console.log("current notification Data:");
      console.log(currentData);
      console.log();
      //console.log(results);
      let data = generateNotificationList(results,currentData);
      //console.log(data);
      return callback(data);
    }
  });
}

//get subscription info
const getSubscriptionInfo = (id) => {
  return SubscribeListData.findById(id)
    .select('option condition groupType title _sensorID')
    .exec();
}
//get subscription related sensor's info
const getSubscription_relatedSensorInfo = (id) => {
  return SubscribeListData.findById(id)
    .populate({
      path: '_sensorID',
      select:'_id name temp onConnect'
    })
    .select('previousMatch option condition groupType title')
    .exec();
}
//update subscription info
const updateSubscriptionInfo = (doc) => {
  var updateData;
  //filter update data
  if(doc.option) {
    updateData = {
      option : doc.option,
      condition : convertCondition(doc.condition)
    };
  }
  else if(doc.groupType) {
    updateData = {
      groupType : doc.groupType,
      condition : convertCondition(doc.condition)
    };
  }
  //console.log(updateData);


  return new Promise((resolve, reject) => {
    SubscribeListData.updateOne({ _id: ObjectId(doc._id) },
      { $set: updateData })
      .exec()
      .then(result => {
        console.log(result);
        resolve("ok");
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}
const getSubscriptions_bySubscriber = (id) => {
  return SubscribeListData.find({_subscriber:ObjectId(id)})
    .select('_id title').exec();
}
const getSubCondition_bySID = (id) => {
  return SubscribeListData.find({_sensorID:ObjectId(id)})
    .select('_id condition').exec();
}
module.exports = {
  searchSubscribeList_withSensorID,
  searchSubList_withSubName,
  findAllSubscriber_bySensorID,
  subscribeOne,
  subscribeMany,
  unsubscribeOne,
  unsubscribeMany,
  notificationList,
  findSubscribeBefore,
  updateSubList_PreviousValue,
  updateSubList_PreviousMatchCondition,
  getSubscriptionInfo,
  updateSubscriptionInfo,
  getSubscriptions_bySubscriber,
  getSubscription_relatedSensorInfo,
  getSubCondition_bySID
};
