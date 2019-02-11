var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var moment = require('moment');
var ObjectId = require('mongodb').ObjectID;
const {searchSensorHistory} = require('../../controllers/sensorHistory');
const {findUserID,createUser} = require('../../controllers/user');
const {searchAllSensor,searchSensorByID} = require('../../controllers/sensor');
const {
  subscribeOne,searchSubList_withSubName,
  unsubscribeMany,subscribeMany,findSubscribeBefore,
} = require('../../controllers/SubscribeList');
const {saveSubscriptionLogs} = require('../../controllers/subscriptionLogs');
const {convertCondition} = require('../../server/utils/convert');
const {getStartAndEnd,avgInInterval,findInterval} = require('../../server/utils/DateAndTime')

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
var GetSensorInfo = (req, res, next) => {
  //check user login and get session
  console.log(`GET - ${req.session.views} request sensor info page`);
  searchSensorByID(req.params.sensorId)
    .then(sensorInfo => {
      if(!sensorInfo) {
        console.log("did not found any result");
        res.send("404 no found");
        return;
      }
      var time = getStartAndEnd(moment(),5,"minutes",1,"hours");
      //searching sensor history with and sensorID
      searchSensorHistory(req.params.sensorId,time.startOfTime,time.endOfTime)
      .then(result => {
        if(!result)
        {
          console.log("did not found any result");
          res.render('sensorInfo',{foundIt:false,session:req.session.views});
          return;
        }
        console.log(sensorInfo);
        //reduce multiple data into different interval of data
        var afterAvg = avgInInterval(result,5,"minutes",time.startOfTime,time.endOfTime);//avg the result in every 5 min
        res.render('sensorInfo',{
          items:JSON.stringify(afterAvg),
          foundIt:true,
          session:req.session.views,
          sensorID:req.params.sensorId,
          sensorInfo:sensorInfo[0]
        });
      })
      .catch(err => {
        res.send({msg:err.message});
        console.log(err);
      });

    })
    .catch(err => {
      res.send({msg:err.message});
      console.log(err);
    });

}
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
var UserLogin = (req, res, next) => {
  console.log(`POST - ${req.body.name} try to login`);
  //session = user name
  req.session.views = req.body.name;
  findUserID(req.body.name)
    .then(userID => {
      if(!userID)
      {
        createUser(req.body.name)
          .then(result => {
            if(result)
            {
              console.log(result);
              res.redirect('/getData');
              return;
            }
          })
          .catch(err => {
            console.log(err);
            res.send({err:err.message});
            return;
          });
      }
      else {
        req.session.userID = userID._id;
        res.redirect('/getData');
      }

    })

  console.log(req.session);
  //console.log("sessionID: "+req.session.id);
}
var Subscribe = (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /subscribe`);
  findUserID(req.session.views,(id) => {
    var userID = id;
    console.log();
    subscribeOne(
      req.session.views,
      userID,
      req.body.sensorID,
      req.body.option,
      convertCondition(req.body.condition),
      (result) => {
        if(result == "error") {//response to ajax
          res.status(400).json({msg:"error"});
        }
        else {
          res.json({subListID:result._id, sensorID:result._sensorID});
        }
      });


  })
}
var SubscribeMany = (req, res, next) => {
  console.log(`POST - ${req.session.views} request a ajax call /subscribeMany`);
  findSubscribeBefore(req.session.views,req.body.subscription)//find exist subscription
    .then(exist => {
      if(exist && exist.length)
      {
        console.log("exist : "+exist);
        throw new Error("sensor already subscribe before");
      }
      findUserID(req.session.views)//find user ID
        .then(userID => {
          if(!userID)
          {
            console.log("did not found userID");
            throw new Error("did not found userID");
          }
          //subscribe new
          return subscribeMany(req.session.views,userID,req.body.subscription);
        })
        .then(results => {
          res.json({msg:"success"});
          var docs = results.map(doc => {
            return {
              _subscription:doc._id,
              _subscriber:req.session.userID,
              title: `created a subscription`,
              logMsg: doc.groupType === null? doc.title:`group "${doc.title}"`,
              logStatus: 3
            }
          });
          console.log();
          console.log(docs);
          console.log();
          //save the subscription logs
          //about user created the subscription info
          saveSubscriptionLogs(docs);
          //console.log(results);
        })
        .catch(err => {
          throw new Error(err.message);
          console.log(err);
        });
    })
    .catch(err => {
      res.status(400).json({msg:err.message});
      console.log(err);
    });
}


module.exports = {
  SubscribeMany,
  Subscribe,
  UserLogin,
  GetHistoryData,
  GetSensorInfo,
  MainPage
 };
