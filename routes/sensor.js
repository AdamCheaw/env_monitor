var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var SensorData = require('../model/sensor');
var moment = require('moment');
var emitter = require('socket.io-emitter')({ host: 'localhost', port: '6379' });

emitter.redis.on('error', onError);

function onError(err){
  console.log(err);
}

router.post('/insert', (req, res, next) => {
  // res.status(200).json({
  //   message: "receive request packet!"
  // });
  // console.log("receive request packet from "+req.body.name);
  // console.log("Temp : "+req.body.temp);
  // console.log(new Date());

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
});

router.patch('/update', (req, res, next) => {
  var id = req.body.sensorId;
  console.log("received notification message from "+id);
  emitter.emit('notification',function () {
    console.log('Notification to user about data change');
  });
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
    console.log("ID : "+req.body.sensorId);
    console.log("Temp : "+req.body.temp);
    console.log("Date : "+moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'));
    console.log("...................................................................");
  })
  .then(doc => {
    if(doc) {
      res.status(200).json({
        message: "updated !"
      });

      // io.on('connection', function (socket) {
      //  socket.emit('notification',function () { });
      //   // socket.on('message', function () { });
      //   // socket.on('disconnect', function () { });
      // });
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
