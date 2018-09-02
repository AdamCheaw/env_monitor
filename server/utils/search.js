var SubscribeList = require('../../model/SubscribeList');
var SensorData = require('../../model/sensor');
var expressSession = require('express-session');

var searchSubscribeList = (name, callback) => {
  var doc;
  SubscribeList.find({subscriber:name})
    .populate('_sensorID')
    .exec()
    .then(docs => {
      if(docs){
        //doc = docs
        callback(docs);
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
    // if(doc)
    // {
    //   return doc;
    // }
}

module.exports = {searchSubscribeList};
