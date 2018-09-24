var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var SensorData = require('../model/sensor');
var moment = require('moment');
const {searchUser_withName} = require('../controllers/user');
const {searchAllSensor} = require('../controllers/sensor');
const {subscribeOne} = require('../controllers/SubscribeList');
const {subscribe,unsubscribe_with_socketID,unsubscribe_with_name} = require('../server/utils/subscribe_event');
const {countLine} = require('../server/utils/countLine');
// var a = { people: [
//     {firstName: "Yehuda", lastName: "Katz"},
//     {firstName: "Carl", lastName: "Lerche"},
//     {firstName: "Alan", lastName: "Johnson"}
//   ]} ;
router.get('/',(req, res, next) => {
  if (!req.session.views) {
    res.render('login');
    return;
  }
  searchAllSensor((result) => {
    //console.log(result);
    res.render('getAll',{items:result, session:req.session.views});
  })
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

  //req.session.views = sessionData;
  //assign username and id to session
  req.session.views = req.body.name;
  //req.session.userID = sessionData;
  res.redirect('/getData');
  console.log(req.session);
  console.log("sessionID: "+req.session.id);
});
//user subscribe
router.post('/subscribe', (req, res, next) => {
  //var userID;

  // //remove previous subscribe
  // if(req.body.subscribe_checkbox) {unsubscribe_with_name(req.session.views);}
  // else{ return res.redirect('/getData'); }
  //
  // searchUser_withName(req.session.views,(result) => {
  //   var userID = result;
  //   var subscribe_array = [];
  //   //check subscribe_checkbox is greater than 1
  //   if(Array.isArray(req.body.subscribe_checkbox)) {
  //     for(var i = 0; i < req.body.subscribe_checkbox.length;i++) {
  //       subscribe_array.push(req.body.subscribe_checkbox[i])
  //     }
  //   }
  //   else {
  //     subscribe_array.push(req.body.subscribe_checkbox)
  //   }
  //   //console.log(userID);
  //   subscribe(req.session.views,userID,subscribe_array);
  // })
  searchUser_withName(req.session.views,(id) => {
    var userID = id;
    console.log("sensorID :"+req.body.sensorID);
    subscribeOne(req.session.views,userID,req.body.sensorID,(result) => {
      if(result == "success") {//response to ajax
        res.json({msg:"success"});
      }
      else {
        res.json({msg:"error"});
      }
    });
  })


  //res.redirect('/getData');
});
module.exports = router;
