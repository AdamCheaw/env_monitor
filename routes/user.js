var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var SensorData = require('../model/sensor');
var moment = require('moment');
const {findUserID} = require('../controllers/user');
const {searchAllSensor} = require('../controllers/sensor');
const { subscribeOne,unsubscribeOne,searchSubList_withSubName,
        unsubscribeMany,subscribeMany,findExist} = require('../controllers/SubscribeList');
const {subscribe,unsubscribe_with_socketID,unsubscribe_with_name} = require('../server/utils/subscribe_event');
// const {countLine} = require('../server/utils/countLine');
const {convertCondition} = require('../server/utils/convert');
router.get('/',(req, res, next) => {
  if (!req.session.views) {
    res.render('login');
    return;
  }
  searchAllSensor((sensorData_result) =>{
    //searching the sensor subscribe by this user
    searchSubList_withSubName(req.session.views,(sub_result) => {
      //console.log("sub_result : "+sub_result);
      if(sub_result != "" || sub_result !== undefined) {
        var subscribe_sensor = sub_result.map(data => {
          return {
            sensorID: data._sensorID._id,
            subscribeID: data._id
          };
        });
      }
      res.render('getAll',{items:sensorData_result, session:req.session.views, subscribe_sensor:JSON.stringify(subscribe_sensor)});
    });
  });
});

router.get('/:sensorId', (req, res, next) => {
  //check user login and get session
  if (!req.session.views) {
    res.render('login');
    return;
  }
  var sensorId = req.params.sensorId;
  console.log(sensorId);
  SensorData.findById(sensorId)
    .select("name date _id temp")
    .exec()
    .then(doc => {
      //console.log("From database", doc);
      if (doc) {
        res.render('get_by_id', {
          id:doc._id,
          date:moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'),
          name: doc.name,
          temp: doc.temp
        });
      } else {
        res.status(404).json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
//handle user login
router.post('/submit', (req, res, next) => {

  //session = user name
  req.session.views = req.body.name;
  res.redirect('/getData');
  console.log(req.session);
  console.log("sessionID: "+req.session.id);
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
