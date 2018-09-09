var SensorData = require('../model/sensor');
var UserData = require('../model/user');
var SubscribeListData = require('../model/SubscribeList');
var mongoose = require('mongoose');
var express = require('express');
var ObjectId = require('mongodb').ObjectID;
var searchSubscribeList_withSensorID = (sensorID,callback) => {
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
        callback(items);
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
      select:'name temp date onConnect'
    })
    .select('subscriberName')
    .exec()
    .then(docs => {
      if(docs){
        //doc = docs
        callback(docs);
        return;
        console.log("searchSubscribeList_withSubscriberName: "+docs);
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

module.exports = {searchSubscribeList_withSensorID,searchSubList_withSubName};
