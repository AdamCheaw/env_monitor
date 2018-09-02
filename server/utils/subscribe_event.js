var SubscribeList = require('../../model/SubscribeList');
var mongoose = require('mongoose');

var subscribe = (name,sensorID) => {
  var items = [];
  var doc = {};
  //push multiple sensorID(array) into items
  sensorID.forEach(item => {
    doc.subscriber = name;
    doc._sensorID = mongoose.Types.ObjectId(item);
    items.push(doc);
  });

  SubscribeList.insertMany(items, function(error, docs) {
    if(docs) {
      console.log("document insert success!");
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
  SubscribeList.remove({subscriber:name}, (err) => {
    if (err) return handleError(err);
    console.log('the subdocs were removed');
  });
}
module.exports = {subscribe,unsubscribe_with_socketID,unsubscribe_with_name};
