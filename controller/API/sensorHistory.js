var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var moment = require('moment');
// var ObjectId = require('mongodb').ObjectID;

const {searchSensorHistory} = require('../../model/action/sensorHistory');
const {getStartAndEnd,avgInInterval,findInterval} = require('../../server/utils/DateAndTime')

var GetHistoryData = (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /GetHistoryData`);
  console.log(`${req.body.sensorID} & ${req.body.queryDate} & ${req.body.interval}`);
  var timeInterval = findInterval(req.body.interval);
  var time = getStartAndEnd(
    req.body.queryDate,
    timeInterval.intervalNum,
    timeInterval.intervalUnit,
    timeInterval.startTimeNum,
    timeInterval.startTimeUnit
  );
  searchSensorHistory(req.body.sensorID,time.startOfTime,time.endOfTime)
  .then(result => {
    if(!result)
    {
      console.log("did not found any result");
      res.json({msg:"no data found"});
      return;
    }
    //reduce multiple data into different interval of data
    var afterAvgResult = avgInInterval(
      result,
      timeInterval.intervalNum,
      timeInterval.intervalUnit,
      time.startOfTime,
      time.endOfTime
    );//avg the result in every 5 min
    res.json(afterAvgResult);
  })
  .catch(err => {
    res.status(500).json({msg:err.message});
    console.log(err);
  });
  //res.json({msg:"ok"});
}
module.exports = {
  GetHistoryData
};
