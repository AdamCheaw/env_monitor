var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var SensorData = require('../model/sensor');
var moment = require('moment');
// var a = { people: [
//     {firstName: "Yehuda", lastName: "Katz"},
//     {firstName: "Carl", lastName: "Lerche"},
//     {firstName: "Alan", lastName: "Johnson"}
//   ]} ;
router.get('/all',(req, res, next) => {
  SensorData.find()
    .select("name date _id temp")
    .exec()
    .then(docs => {
      var doc;
      var response = {
        count: docs.length,
        data: docs.map(doc => {
          return  {
            _id: doc._id,
            date: moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'),
            name: doc.name,
            temp: doc.temp
          };
        })
      };
      res.render('index2',{items:response});
      //res.status(200).json(response.data[0].date);
      console.log("From database", response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/:sensorId', (req, res, next) =>{
  var sensorId = req.params.sensorId;
  console.log(sensorId);
  SensorData.findById(sensorId)
    .select("name date _id temp")
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          _id: doc._id,
          date: moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'),
          name: doc.name,
          temp: doc.temp
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});


module.exports = router;
