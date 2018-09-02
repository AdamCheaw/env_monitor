var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var SensorData = require('../model/sensor');
var moment = require('moment');
const {checkExpire} = require('../server/utils/checkExpire');
const {subscribe,unsubscribe_with_socketID,unsubscribe_with_name} = require('../server/utils/subscribe_event');
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
  SensorData.find()
    .select("name date _id temp expireTime")
    .exec()
    .then(docs => {
      console.log(docs);
      var doc;
      var response = {

        count: docs.length,
        data: docs.map(doc => {
          return  {
            _id: doc._id,
            date: moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'),
            name: doc.name,
            temp: doc.temp,
            onConnect: checkExpire(doc.date, parseInt(doc.expireTime)),
            expireTime: doc.expireTime
          };
        })
      };
      res.render('getAll',{items:response, session:req.session.views});

      //res.status(200).json(response.data[0].date);
      //console.log("From database", response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
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
  req.session.views = req.body.name;
  //name = {name:req.session.views,id:123};
  res.redirect('/getData/');
  console.log(req.session.views+" 's "+req.session.id);
});
//user subscribe
router.post('/subscribe', (req, res, next) => {
  //remove previous subscribe
  if(req.body.subscribe_checkbox) {unsubscribe_with_name(req.session.views);}
  else{ return res.redirect('/getData'); }
  var subscribe_array = [];
  //check subscribe_checkbox is greater than 1
  if(Array.isArray(req.body.subscribe_checkbox)) {
    for(var i = 0; i < req.body.subscribe_checkbox.length;i++) {
      subscribe_array.push(req.body.subscribe_checkbox[i])
    }
  }
  else {
    subscribe_array.push(req.body.subscribe_checkbox)
  }
  subscribe(req.session.views,subscribe_array);
  res.redirect('/getData');
});
module.exports = router;
