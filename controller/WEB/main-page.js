var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
const {searchAllSensor} = require('../../model/action/sensor');
const {searchSubList_withSubName} = require('../../model/action/SubscribeList');
var MainPage = (req, res, next) => {
  console.log(`GET - ${req.session.views} request MainPage`);
  searchAllSensor((sensorData_result) =>{
    //searching the sensor subscribe by this user
    searchSubList_withSubName(req.session.views,(sub_result) => {
      //console.log("sub_result : "+sub_result);
      if(sub_result != "" && sub_result !== undefined && sub_result !== null) {
        var subscribe_sensor = sub_result.map(data => {
          return {
            sensorID: data._sensorID.map(sensor => ObjectId(sensor._id)),
            subscribeID: data._id
          };
        });
        res.render('getAll',{items:sensorData_result, session:req.session.views, subscribe_sensor:JSON.stringify(subscribe_sensor)});
      }
      else {
        res.render('getAll',{items:sensorData_result, session:req.session.views, subscribe_sensor:JSON.stringify({})});
      }
    });
  });
}
module.exports = {
  MainPage
};
