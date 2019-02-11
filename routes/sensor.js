var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var SensorData = require('../model/sensor');
var sensorHistory = require('../model/sensorHistory');
var moment = require('moment');
// var emitter = require('socket.io-emitter')({ host: 'localhost', port: '6379' });
var io = require('socket.io-client');
const {generateSensorData} = require('../server/utils/generate');

//received advertisement from sensor
router.post('/insert', (req, res, next) => {
  SensorData.findOne({name:req.body.name},(err,doc) =>{
    var currentDate = new Date();
    if (!doc) {//nothing found , insert a new document
      var item = {
        name: req.body.name,
        temp: req.body.temp,
        date: currentDate,
        type: req.body.type,
        expireTime : 210, //seconds
        onConnect:true,
        expireDate:moment(currentDate).add(210, 's'),
        previousValue: ""
      };
      var data = new SensorData(item);
      data.save()
        .then(result => {
          res.status(200).json({
            message: "receive request packet!",
            sensorId: data._id
          });
          //save a history data
          var record = new sensorHistory({
            name: req.body.name,
            value: req.body.temp,
            date: currentDate,
            _sensorID : ObjectId(data._id),
          });
          record.save()
          .catch(err => {
            console.log(err);
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
      doc.previousValue = doc.temp;
      doc.temp = req.body.temp;
      doc.date = new Date();
      doc.onConnect = true;
      doc.expireTime = 210; //seconds
      doc.expireDate = moment(currentDate).add(210, 's');//210
      previousValue: "";
      //doc.onConnect = true;
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
      //save a history data
      var record = new sensorHistory({
        name: req.body.name,
        value: req.body.temp,
        date: currentDate,
        _sensorID : ObjectId(doc._id),
      });
      record.save()
      .catch(err => {
        console.log(err);
      });
    }
  });

});
//receive a notification from sensor
router.post('/update', (req, res, next) => {
  var currentDate = new Date();
  var id = req.body.sensorId;
  console.log();
  console.log("received notification message from sensor("+id+")");
  console.log();
  SensorData.findById(id, (err, doc) => {
    if (err) {
      console.error('error, no entry found');
      res.status(404).json({
        error: err
      });
      return;
    }
    //save in history data
    var record = new sensorHistory({
      name: doc.name,
      value: req.body.temp,
      date: currentDate,
      _sensorID : ObjectId(doc._id),
    });
    record.save()
    .catch(err => {
      console.log(err);
    });
    //update the sensor Data
    doc.previousValue = doc.temp;
    doc.temp = req.body.temp;
    doc.date = currentDate;
    doc.onConnect = true;
    doc.expireDate = moment(currentDate).add(210, 's');//210
    //doc.onConnect = true;
    doc.save()
    .then(doc => {
      if(doc) {
        res.status(200).json({
          message: "updated success!"
        });
        var socket = io('http://localhost:3000');
        socket.emit('update', generateSensorData(doc,""));
        console.log('emit an update event to server about data change');
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: "updated failed!"
      });
    });

    //  console.log(doc.name+" updated data");
    // // console.log("ID : "+req.body.sensorId);
    // // console.log("Temp : "+req.body.temp);
    //  console.log("Date : "+moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'));
    //  console.log("...................................................................");
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});
module.exports = router;
