var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var SensorData = require('../../model/sensor');
var sensorHistory = require('../../model/sensorHistory');
var {findAllSubscriber_bySensorID} = require('../../controllers/SubscribeList');
var {saveSubscriptionLogs} = require('../../controllers/subscriptionLogs');
var {searchOneSensor_byName,searchOneSensor_byID} = require('../../controllers/sensor');
var moment = require('moment');
// var emitter = require('socket.io-emitter')({ host: 'localhost', port: '6379' });
var io = require('socket.io-client');
const {generateSensorData} = require('../../server/utils/generate');

const SensorRegister = async (req, res, next) => {
  try {
    let sensor = await searchOneSensor_byName(req.body.name);
    var currentDate = new Date();
    if(!sensor) {//nothing found , insert a new document
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
      data.save()//created new sensorData
        .then(() => {
          //save sensor history data
          var record = new sensorHistory({
            name: req.body.name,
            value: req.body.temp,
            date: currentDate,
            _sensorID : ObjectId(data._id)
          });
          record.save();
        });
      res.status(200).json({
        message: "receive request packet!",
        sensorId: data._id
      });

      console.log();
      console.log("new sensor!");
      console.log("Sensor - receive register request packet from "+req.body.name);
      console.log("ID : "+data._id);
      console.log("Value : "+data.temp);
      console.log("Date : "+moment.parseZone(data.date).local().format('YYYY MMM Do h:mm:ss a'));
      console.log("...................................................................");
      console.log();
    }//end if
    else {//when sensor found!
      sensor.previousValue = sensor.temp;
      sensor.temp = req.body.temp;
      sensor.date = new Date();
      sensor.onConnect = true;
      sensor.expireTime = 210; //seconds
      sensor.expireDate = moment(currentDate).add(210, 's');//210
      sensor.save();//update sensor info
      res.status(200).json({
        message: "receive request packet!",
        sensorId: sensor._id
      });
      console.log();
      console.log("sensor already find in the document");
      console.log("Sensor - receive register request packet from "+req.body.name);
      console.log("ID : "+sensor._id);
      console.log("Value : "+sensor.temp);
      console.log("Date : "+moment.parseZone(sensor.date).local().format('YYYY MMM Do h:mm:ss a'));
      console.log("...................................................................");
      console.log();
      //save a history data
      var record = new sensorHistory({
        name: req.body.name,
        value: req.body.temp,
        date: currentDate,
        _sensorID : ObjectId(sensor._id),
      });
      record.save();
      let socket = io('http://localhost:3000');
      socket.emit('sensor connect', generateSensorData(sensor,""));
      console.log('emit an sensor onConnect event');
    }
  }
  catch (err) {
    console.log(err);
    res.status(404).json({
      error: err
    });
  }

};

const SensorUpdated = async (req, res, next) => {
  console.log();
  console.log("received notification message from sensor("+req.body.sensorId+")");
  console.log();
  var currentDate = new Date();
  try {
    let sensor = await searchOneSensor_byID(req.body.sensorId);
    let sensorPreviousConnect = sensor.onConnect;
    sensor.previousValue = sensor.temp;
    sensor.temp = req.body.temp;
    sensor.date = currentDate;
    sensor.onConnect = true;
    sensor.expireDate = moment(currentDate).add(210, 's');//210
    //doc.onConnect = true;
    sensor.save();
    res.status(200).json({
      message: "receive request packet!"
    });
    let socket = io('http://localhost:3000');
    if(!sensorPreviousConnect) {//sensor is offline before
      socket.emit('sensor connect', generateSensorData(sensor,""));
      console.log('emit an sensor onConnect event');
    }
    else {
      socket.emit('update', generateSensorData(sensor,""));
      console.log('emit an update event to server about data change');
    }

    var record = new sensorHistory({
      name: sensor.name,
      value: req.body.temp,
      date: currentDate,
      _sensorID : ObjectId(sensor._id),
    });
    record.save()
  }
  catch (err) {
    console.log(err);
    res.status(404).json({
      error: err
    });
  }
  // var currentDate = new Date();
  // var id = req.body.sensorId;
  //
  // SensorData.findById(id, (err, doc) => {
  //   if (err) {
  //     console.error('error, no entry found');
  //     res.status(404).json({
  //       error: err
  //     });
  //     return;
  //   }
  //   //save in history data
  //   var record = new sensorHistory({
  //     name: doc.name,
  //     value: req.body.temp,
  //     date: currentDate,
  //     _sensorID : ObjectId(doc._id),
  //   });
  //   record.save()
  //   .catch(err => {
  //     console.log(err);
  //   });
  //   //update the sensor Data
  //   doc.previousValue = doc.temp;
  //   doc.temp = req.body.temp;
  //   doc.date = currentDate;
  //   doc.onConnect = true;
  //   doc.expireDate = moment(currentDate).add(210, 's');//210
  //   //doc.onConnect = true;
  //   doc.save()
  //   .then(doc => {
  //     if(doc) {
  //       res.status(200).json({
  //         message: "updated success!"
  //       });
  //       var socket = io('http://localhost:3000');
  //       socket.emit('update', generateSensorData(doc,""));
  //       console.log('emit an update event to server about data change');
  //     }
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     res.status(500).json({
  //       error: "updated failed!"
  //     });
  //   });
  //
  //   //  console.log(doc.name+" updated data");
  //   // // console.log("ID : "+req.body.sensorId);
  //   // // console.log("Temp : "+req.body.temp);
  //   //  console.log("Date : "+moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'));
  //   //  console.log("...................................................................");
  // })
  // .catch(err => {
  //   console.log(err);
  //   res.status(500).json({
  //     error: err
  //   });
  // });
};

module.exports = {
  SensorRegister,SensorUpdated
}
