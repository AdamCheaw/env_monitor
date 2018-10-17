var SensorData = require('../model/sensor');
var UserData = require('../model/user');
var SubscribeListData = require('../model/SubscribeList');
var mongoose = require('mongoose');
var express = require('express');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');

// find all subscriber subscribe this sensor
var searchSubscribeList_withSensorID = (sensorID,callback) => {
  console.log("DB : "+sensorID);
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
      select:'_id name temp date onConnect'
    })
    .select('subscriberName option condition')
    .exec()
    .then(docs => {
      if(docs){
        var result = [];
        docs.forEach(doc => {
          var item = {
             _id: doc._id,
             _sensorID: {
               _id: doc._sensorID._id,
               name: doc._sensorID.name,
               temp: doc._sensorID.temp,
               date: moment.parseZone(doc._sensorID.date).local().format('YYYY MMM Do, h:mm:ssa'),
               onConnect: doc._sensorID.onConnect
             },
             subscriberName: doc.subscriberName,
             option: doc.option,
             condition: doc.condition
          };
          result.push(item);
        })
        // var result = docs.map(doc => {
        //   return {
        //     _id: doc._id,
        //     _sensorID: {
        //       _id: doc._sensorID._id,
        //       name: doc._sensorID.name,
        //       temp: doc._sensorID.temp,
        //       date: moment.parseZone(doc._sensorID.date).local().format('YYYY MMM Do, h:mm:ssa'),
        //       onConnect: doc._sensorID.onConnect
        //     },
        //     subscriberName: doc.subscriberName,
        //     option: doc.option,
        //     condition: doc.condition
        //   }
        // });
        //doc = docs
        callback(result);
        //console.log("searchSubscribeList_withSubscriberName: "+docs);
        return;

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
var notificationList = (sensorID,temp,callback) => {
  SubscribeListData.find({
    $and: [
      {_sensorID:ObjectId(sensorID)},
      {$or : [
        { option: "default" },
        {
          option: "advanced",
          $or : [
            {
              condition: {
                $elemMatch: {type:"max",value:{$lt: temp }}
              }
            },
            {
              condition: {
                $elemMatch: {type:"min",value:{$gte: temp }}
              }
            }
          ]
        }
      ]}
    ]
  })
  .populate({
    path:'_subscriber',
    match:{onConnect:true},
    select:'socketID'
  })
  .select('_id _subscriber option condition')
  .exec((err,subscribers) =>{
    if(err){
      console.log(err);
      return;
    }
    else {
      //console.log("DB searching match subscriber :"+subscribers);
      var items = [];
      subscribers.forEach(item => {
        if(item._subscriber){//if !null push to the items
          var result = {
            socketID : item._subscriber.socketID,
            option : item.option,
            condition : item.condition
          }
          items.push(result);
          //console.log("items.push(item._subscriber.socketID)"+item._subscriber.socketID);
        }
      });
      return callback(items);
      //console.log(items);
    }
  });
}
module.exports = {
  searchSubscribeList_withSensorID,
  searchSubList_withSubName,
  subscribeOne,
  unsubscribeOne,
  notificationList
};
