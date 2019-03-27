const sensorHistory = require('../schema/sensorHistory');
const subscriptionLogs = require('../schema/subscriptionLogs');
const cron = require("node-cron");
const moment = require("moment") ;
var removeExHistoryData = () => {
  //delete data in every 12p.m
  cron.schedule("0 12 * * *", function() {
    //delete history data in two days ago
    var start = new Date(moment().subtract(2, 'days')).toISOString();
    //console.log(start);
    sensorHistory.deleteMany({
      date:{
        $lte:start
      }
    })
    .exec()
    .then(() => {
      console.log(`remove before ${start} 's history data `);
    })
    .catch(err => {
      console.log(err);
    });
  });
}
var removeExSubscriptionLogs = () => {
  //delete data in every 12p.m
  cron.schedule("0 12 * * *", function() {
    //delete subscription logs in three days ago
    var start = new Date(moment().subtract(3, 'days')).toISOString();
    //console.log(start);
    subscriptionLogs.deleteMany({
      date:{
        $lte:start
      }
    })
    .exec()
    .then(() => {
      console.log(`remove before ${start} 's logs `);
    })
    .catch(err => {
      console.log(err);
    });
  });
}
module.exports = { removeExHistoryData,removeExSubscriptionLogs };
