const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const SensorData = require('../../model/schema/sensor');
const sensorHistory = require('../../model/schema/sensorHistory');
const {
  findAllSubscriber_bySensorID
} = require('../../model/action/SubscribeList');
const {
  saveSubscriptionLogs
} = require('../../model/action/subscriptionLogs');
const {
  searchOneSensor_byName,
  searchOneSensor_byID,
  searchSensorByID,
  getAllSensor
} = require('../../model/action/sensor');
const moment = require('moment');
const io = require('socket.io-client');
const {
  generateSensorData
} = require('../../server/utils/generate');
const subscribeEvent = require('../../server/events/subEvent');
const {
  PublishCondition
} = require('../../server/constructor/publisher');
var newPubCondition = new PublishCondition();
//listening user changing subscription condition events
subscribeEvent.on('publishConditionChange', (docs) => {
  console.log();
  console.log("listen an event");
  console.log(docs);
  //add new publish condition
  newPubCondition.addPublishCondition(docs);
  console.log(newPubCondition.show());
});
const SensorRegister = async (req, res, next) => {
  try {
    let sensor = await searchOneSensor_byName(req.body.name);
    var currentDate = new Date();
    if(!sensor) { //nothing found , insert a new document
      var item = {
        name: req.body.name,
        value: req.body.value,
        date: currentDate,
        type: req.body.type,
        expireTime: 210, //seconds
        onConnect: true,
        expireDate: moment(currentDate).add(210, 's'),
        previousValue: ""
      };
      var data = new SensorData(item);
      data.save() //created new sensorData
        .then(() => {
          //save sensor history data
          var record = new sensorHistory({
            name: req.body.name,
            value: req.body.value,
            date: currentDate,
            _sensorID: ObjectId(data._id)
          });
          record.save();
        });
      res.status(200).json({
        message: "receive request packet!",
        sensorId: data._id,
        publishStatus: 1,
        publishCondition: null
      });

      console.log();
      console.log("new sensor!");
      console.log("Sensor - receive register request packet from " + req.body.name);
      console.log("ID : " + data._id);
      console.log("Value : " + data.value);
      console.log("Date : " + moment.parseZone(data.date).local().format('YYYY MMM Do h:mm:ss a'));
      console.log("...................................................................");
      console.log();
    } //end if
    else { //when sensor found!
      sensor.previousValue = sensor.value;
      sensor.value = req.body.value;
      sensor.date = new Date();
      sensor.onConnect = true;
      sensor.expireTime = 210; //seconds
      sensor.expireDate = moment(currentDate).add(210, 's'); //210
      sensor.save(); //update sensor info
      res.status(200).json({
        message: "receive request packet!",
        sensorId: sensor._id,
        //if publishCondition equal default ,status = 1, else status = 2
        publishStatus: (
          Array.isArray(sensor.publishCondition) && sensor.publishCondition.length === 0
        ) ? 1 : 2,
        publishCondition: (
          Array.isArray(sensor.publishCondition) && sensor.publishCondition.length === 0
        ) ? null : [sensor.publishCondition[0].value, sensor.publishCondition[1].value]
      });
      console.log();
      console.log("sensor already find in the document");
      console.log("Sensor - receive register request packet from " + req.body.name);
      console.log("ID : " + sensor._id);
      console.log("Value : " + sensor.value);
      console.log("Date : " + moment.parseZone(sensor.date).local().format('YYYY MMM Do h:mm:ss a'));
      console.log("...................................................................");
      console.log();
      //save a history data
      var record = new sensorHistory({
        name: req.body.name,
        value: req.body.value,
        date: currentDate,
        _sensorID: ObjectId(sensor._id),
      });
      record.save();
      let socket = io('http://localhost:3000');
      socket.emit('sensor connect', generateSensorData(sensor, ""));
      console.log('emit an sensor onConnect event');
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      error: err
    });
  }
};

const SensorUpdated = async (req, res, next) => {
  var currentDate = new Date();
  console.log();
  console.log("received notification message from sensor(" + req.body.sensorId + ")");
  console.log(currentDate);
  console.log();

  try {
    let sensor = await searchOneSensor_byID(req.body.sensorId);
    let sensorPreviousConnect = sensor.onConnect;
    sensor.previousValue = sensor.value;
    sensor.value = req.body.value;
    sensor.date = currentDate;
    sensor.onConnect = true;
    sensor.expireDate = moment(currentDate).add(210, 's'); //210
    //doc.onConnect = true;
    sensor.save();
    let condition = newPubCondition.getPublishCondition_byID(req.body.sensorId);
    let publishStatus;
    switch (true) {
      case condition == null:
        publishStatus = 0; //stay with oiriginal publishCondition
        break;
      case Array.isArray(condition) && condition.length === 0:
        publishStatus = 1; //change publishCondition to default
        break;
      case Array.isArray(condition) && condition.length > 0:
        publishStatus = 2; //change publishCondition to advanced
        break;
      default:
        break;
    }
    console.log(`publishStatus = ${publishStatus}`);
    res.status(200).json({
      message: "receive request packet!",
      publishStatus: publishStatus,
      publishCondition: (publishStatus < 2) ?
        null : [condition[0].value, condition[1].value]
    });
    let socket = io('http://localhost:3000');
    if(!sensorPreviousConnect) { //sensor is offline before
      socket.emit('sensor connect', generateSensorData(sensor, ""));
      console.log('emit an sensor onConnect event');
    } else {
      socket.emit('update', generateSensorData(sensor, ""));
      console.log('emit an update event to server about data change');
    }

    var record = new sensorHistory({
      name: sensor.name,
      value: req.body.value,
      date: currentDate,
      _sensorID: ObjectId(sensor._id),
    });
    record.save()
  } catch (err) {
    console.log(err);
    res.status(404).json({
      error: err
    });
  }
};
const GetAllSensor = async (req, res, next) => {
  try {
    var results = await getAllSensor();
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(404).json({
      error: err.message
    });
  }

};

const GetSensorByID = async (req, res, next) => {
  try {
    var result = await searchSensorByID(req.params.sensorID);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(404).json({
      error: err.message
    });
  }
};

module.exports = {
  SensorRegister,
  SensorUpdated,
  GetAllSensor,
  GetSensorByID
}