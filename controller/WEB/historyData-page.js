var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;

const { searchSensorHistory } = require('../../model/action/sensorHistory');
const { searchSensorByID } = require('../../model/action/sensor');
const {
  getStartAndEnd,
  avgIntervalValue,
  findInterval
} = require('../../server/utils/DateAndTime');

var GetSensorInfo = (req, res, next) => {
  console.log(`GET - ${req.session.views} request sensor info page`);
  searchSensorByID(req.params.sensorId)
    .then(sensorInfo => {
      if(!sensorInfo) {
        console.log("did not found any result");
        res.send("404 no found");
        return;
      }
      // console.log(sensorInfo);
      var time = getStartAndEnd(moment(), 5, "minutes", 1, "hours");
      //searching sensor history with and sensorID
      searchSensorHistory(req.params.sensorId, time.startOfTime, time.endOfTime)
        .then(result => {
          if(Array.isArray(result) && result.length === 0) {
            console.log("did not found any result");
            res.render('sensorInfo', {
              foundIt: false,
              session: req.session.views,
              sensorInfo: sensorInfo[0],
              sensorID: req.params.sensorId,
            });
            return;
          }
          // console.log(result);
          //reduce multiple data into different interval of data
          var afterAvg = avgIntervalValue(result, 5, "minutes", time.startOfTime, time.endOfTime); //avg the result in every 5 min
          console.log();
          console.log(afterAvg);
          res.render('sensorInfo', {
            items: JSON.stringify(afterAvg),
            foundIt: true,
            session: req.session.views,
            sensorID: req.params.sensorId,
            sensorInfo: sensorInfo[0]
          });
        })
        .catch(err => {
          res.send({ msg: err.message });
          console.log(err);
        });

    })
    .catch(err => {
      res.send({ msg: err.message });
      console.log(err);
    });
}
module.exports = {
  GetSensorInfo
};