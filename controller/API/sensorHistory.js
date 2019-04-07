var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;

const {
  searchSensorHistory
} = require('../../model/action/sensorHistory');
const {
  getStartAndEnd,
  avgInInterval,
  findInterval
} = require('../../server/utils/DateAndTime')

var GetHistoryData = (req, res, next) => {
  // console.log(`POST - ${req.session.views||req.userData._id} request a ajax call /GetHistoryData`);
  console.log(`${req.params.sensorID} & ${req.body.queryDate} & ${req.body.interval}`);
  if(!req.body.queryDate || !req.body.interval) { //initial the history data interval
    var intervalNum = 5,
      intervalUnit = "minutes",
      startTimeNum = 1,
      startTimeUnit = "hours",
      queryDate = moment();
  } else { //calculate history data interval
    var {
      intervalNum,
      intervalUnit,
      startTimeNum,
      startTimeUnit
    } = findInterval(req.body.interval);
    var queryDate = req.body.queryDate;
  }
  var { startOfTime, endOfTime } = getStartAndEnd(
    queryDate,
    intervalNum,
    intervalUnit,
    startTimeNum,
    startTimeUnit
  );
  searchSensorHistory(ObjectId(req.params.sensorID), startOfTime, endOfTime)
    .then(result => {
      if(Array.isArray(result) && result.length === 0) {
        console.log("did not found any result");
        res.status(204).json({
          msg: "no data found"
        });
        return;
      }
      //reduce multiple data into different interval of data
      var afterAvgResult = avgInInterval(
        result,
        intervalNum,
        intervalUnit,
        startOfTime,
        endOfTime
      ); //avg the result in every 5 min
      res.status(200).json(afterAvgResult);
    })
    .catch(err => {
      res.status(500).json({
        msg: "can not query data"
      });
      console.log(err);
    });
  //res.json({msg:"ok"});
}
module.exports = {
  GetHistoryData
};