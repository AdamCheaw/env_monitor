var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var SensorData = require('../model/sensor');
var moment = require('moment');
// var emitter = require('socket.io-emitter')({ host: 'localhost', port: '6379' });
var io = require('socket.io-client');
const {generateData} = require('../server/utils/generate');

//received advertisement from sensor
router.post('/insert', (req, res, next) => {
  SensorData.findOne({name:req.body.name},(err,doc) =>{
    if (!doc) {//nothing found , insert a new document
      var item = {
        name: req.body.name,
        temp: req.body.temp,
        date: new Date()
      };
      var data = new SensorData(item);
      data.save()
        .then(result => {
          res.status(200).json({
            message: "receive request packet!",
            sensorId: data._id
          });
          console.log("new sensor!");
          console.log("receive advertisement request packet from "+req.body.name);
          console.log("ID : "+data._id);
          console.log("Temp : "+data.temp);
          console.log("Date : "+moment.parseZone(data.date).local().format('YYYY MMM Do h:mm:ss a'));
          console.log("...................................................................");
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    }
    else {//if the sensor already insert before , update and responce sensorId
      doc.temp = doc.temp;
      doc.date = new Date();
      doc.save();
      res.status(200).json({
        message: "receive request packet!",
        sensorId: doc._id
      });
      console.log("sensor already find in the document");
      console.log("receive advertisement request packet from "+req.body.name);
      console.log("ID : "+doc._id);
      console.log("Temp : "+doc.temp);
      console.log("Date : "+moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'));
      console.log("...................................................................");
    }
  });

});
//receive a notification from sensor
router.patch('/update', (req, res, next) => {
  var id = req.body.sensorId;
  console.log("received notification message from ("+id+")");
  SensorData.findById(id, (err, doc) => {
    if (err) {
      console.error('error, no entry found');
      res.status(404).json({
        error: err
      });
    }
    //doc.title = req.body.title;
    doc.temp = req.body.temp;
    doc.date = new Date();
    doc.save();
     console.log(doc.name+" updated data");
    // console.log("ID : "+req.body.sensorId);
    // console.log("Temp : "+req.body.temp);
     console.log("Date : "+moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'));
     console.log("...................................................................");
  })
  .then(doc => {
    if(doc) {
      res.status(200).json({
        message: "updated !"
      });
      var socket = io('http://localhost:3000');
      socket.emit('update', generateData(doc));
      //console.log('emit an update event to server about data change');
    }
    else {
      res.status(500).json({
        error: "updated failed!"
      });
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });


});
module.exports = router;
