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
    .exec()
    .then(docs => {
      if(docs){
        console.log(docs);
        var items = [];
        docs.forEach(item => {
          if(item._subscriber){
            items.push(item._subscriber.socketID);
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
    .select('subscriberName')
    .exec()
    .then(docs => {
      if(docs){
        var result = docs.map(doc => {
          return {
            _id: doc._id,
            _sensorID: {
              _id: doc._sensorID._id,
              name: doc._sensorID.name,
              temp: doc._sensorID.temp,
              date: moment.parseZone(doc._sensorID.date).local().format('YYYY MMM Do, h:mm:ssa'),
              onConnect: doc._sensorID.onConnect
            },
            subscriberName: doc.subscriberName
          }
        });
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

var subscribeOne = (name,userID,sensorID,callback) => {
  SubscribeListData.findOne({
      _subscriber : mongoose.Types.ObjectId(userID),
      _sensorID : mongoose.Types.ObjectId(sensorID),
      subscriberName : name
    },(err,doc) => {
      if (!doc) { //nothing found , insert a new document
        var item = {
          _subscriber : mongoose.Types.ObjectId(userID),
          _sensorID : mongoose.Types.ObjectId(sensorID),
          subscriberName : name
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
      else {//already insert before so do nothing first
        callback("already insert");
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
module.exports = {searchSubscribeList_withSensorID,searchSubList_withSubName,subscribeOne,unsubscribeOne};
