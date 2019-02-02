var SensorData = require('../model/sensor');
var UserData = require('../model/user');
var SubscribeListData = require('../model/SubscribeList');
var SensorHistory = require('../model/sensorHistory');
const SubscriptionLogs = require('../model/subscriptionLogs');
var mongoose = require('mongoose');
var moment = require('moment');

var initialSetup = () => {
  SubscribeListData.updateMany({},
  { $set: { previousMatch : false } },
  { multi:true },
  (err,res) => {
    if(err) {
      console.log(err);
    }
    else {
      console.log(`DB: intial subscribeList setup`);
    }
  });

  SensorData.updateMany({},
  { $set: { onConnect : false } },
  { multi:true },
  (err,res) => {
    if(err) {
      console.log(err);
    }
    else {
      console.log(`DB: intial sensorData setup`);
    }
  });

  UserData.updateMany({},
  { $set: { onConnect : false } },
  { multi:true },
  (err,res) => {
    if(err) {
      console.log(err);
    }
    else {
      console.log(`DB: intial userData setup`);
    }
  });

  //delete history data in two days ago
  var start = new Date(moment().subtract(2, 'days')).toISOString();
  SensorHistory.deleteMany({
    date:{
      $lte:start
    }
  })
  .exec()
  .then(() => {
    console.log(`remove before two days ago's history data `);
  })
  .catch(err => {
    console.log(err);
  });

  //delete subscription logs in three days ago
  start = new Date(moment().subtract(3, 'days')).toISOString();
  SubscriptionLogs.deleteMany({
    date:{
      $lte:start
    }
  })
  .exec()
  .then(() => {
    console.log(`remove before three days ago 's logs `);
  })
  .catch(err => {
    console.log(err);
  });
}

module.exports = {
  initialSetup
}
