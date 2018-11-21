var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var SensorData = require('../model/sensor');
const {searchSensorHistory} = require('../controllers/sensorHistory');
var moment = require('moment');
const {findUserID,createUser} = require('../controllers/user');
const {searchAllSensor,searchSensorByID} = require('../controllers/sensor');
const { subscribeOne,unsubscribeOne,searchSubList_withSubName,
        unsubscribeMany,subscribeMany,findExist } = require('../controllers/SubscribeList');
const { subscribe,unsubscribe_with_socketID,unsubscribe_with_name } = require('../server/utils/subscribe_event');
// const {countLine} = require('../server/utils/countLine');
const {convertCondition} = require('../server/utils/convert');
const {getStartAndEnd,avgInInterval,findInterval} = require('../server/utils/DateAndTime')
router.get('/',(req, res, next) => {
  if (!req.session.views) {
    res.render('login');
    return;
  }
  searchAllSensor((sensorData_result) =>{
    //searching the sensor subscribe by this user
    searchSubList_withSubName(req.session.views,(sub_result) => {
      //console.log("sub_result : "+sub_result);
      if(sub_result != "" && sub_result !== undefined && sub_result !== null) {
        var subscribe_sensor = sub_result.map(data => {
          return {
            sensorID: data._sensorID._id,
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
});

router.get('/:sensorId', (req, res, next) => {
  //check user login and get session
  if (!req.session.views) {
    res.render('login');
    return;
  }
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

});
//handle ajax call for HistoryData
router.post('/getHistoryData', (req, res, next) => {
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
});
//handle user login
router.post('/submit', (req, res, next) => {

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
        res.redirect('/getData');
      }

    })

  console.log(req.session);
  //console.log("sessionID: "+req.session.id);
});
//user subscribe
router.post('/subscribe', (req, res, next) => {
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
});
//user subscribe multiple sensor
router.post('/subscribeMany', (req, res, next) => {
  //console.log(req.session.views+" "+JSON.stringify(req.body));
  // var str = req.body;
  // console.log(str);
  // res.json("received msg");
  findExist(req.session.views,req.body.subscription)//find exist subscription
    .then(exist => {
      console.log("exist : "+exist);
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
        .then(result => {
          if(result) {
            console.log("subscribeMany : "+result);
            //unsubscribe previous exist subscription
            return unsubscribeMany(req.session.views,exist);
          }
        })
        .then(result => {
          res.json({msg:"success"});
          console.log(result);
        })
        .catch(err => {
          throw new Error(err);
          console.log(err);
        });
    })
    .catch(err => {
      res.status(400).json({msg:err.message});
      console.log(err);
    });
});
//user unsubscribe
router.post('/unsubscribe', (req, res, next) => {
  unsubscribeOne(req.body.subscribeListID,(result) => {
    if(result == "success") {//response to ajax
      res.json({msg:"success"});
    }
    else {
      res.status(400).json({msg:result});
    }
  })
});
module.exports = router;
