var SubscribeList = require('../../model/SubscribeList');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
//var ObjectId = require('mongodb').ObjectID;
var subscribe = (name,userID,sensorID) => {
  var items = [];

  // var sessionData;
  // searchUser_withName(req.body.name,(result) => {
  //
  //    sessionData = String(result);
  //    console.log(sessionData);
  // })
  //push multiple sensorID(array) into items
  for(var i = 0;i < sensorID.length;i++) {
    var doc = {
      _subscriber : mongoose.Types.ObjectId(userID),
      _sensorID : mongoose.Types.ObjectId(sensorID[i]),
      subscriberName : name
    };
    items.push(doc);
    console.log("userID :"+userID);
  }
  // sensorID.forEach(function(item) {
  //   doc._subscriber = mongoose.Types.ObjectId(userID);
  //   doc._sensorID = ObjectId(item);
  //   doc.subscriberName = name;
  //   items.push(doc);
  //   console.log(item);
  // });

  SubscribeList.insertMany(items, function(error, docs) {
    if(docs) {
      console.log("document insert success!");
      //console.log(docs);
    }
    else {
      return handleError(err);
    }
  });
  // var data = new SubscribeList(items);
  // data.save();
  //console.log("save in mongodb");
};

var unsubscribe_with_socketID = (socketID) => {
  SubscribeList.remove({socketID:socketID}, (err) => {
    if (err) return handleError(err);
    console.log('the subdocs were removed');
  });
}
var unsubscribe_with_name = (name) => {
  SubscribeList.remove({subscriberName:name}, (err) => {
    if (err) return handleError(err);
    console.log('the subdocs were removed');
  });
}
module.exports = {subscribe,unsubscribe_with_socketID,unsubscribe_with_name};
