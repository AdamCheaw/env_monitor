var SensorData = require('../schema/sensor');
var moment = require('moment');
const {
  checkExpire
} = require('../../server/utils/checkExpire');
var ObjectId = require('mongodb').ObjectID;
// const {countLine} = require('../server/utils/countLine');
var io = require('socket.io-client');
var expireDate;
var checkDisconnect = () => {
  var sensor_is_disconnect = [];
  var currentDate = new Date();
  SensorData.find({
      onConnect: true,
      $where: function() {
        return new Date() > this.expireDate;
      }
    })
    .select("_id")
    .exec()
    .then(result => {
      if(result && result != "") {
        console.log("Sensor Disconnect: " + result);
        var items = [];
        for(var i = 0; i < result.length; i++) {
          items.push(result[i]._id);
        }
        // notification server
        var socket = io('http://localhost:3000');
        socket.emit('sensor disconnect', {
          disconnect_SID: items
        });
        console.log('emit an event to server about Sensor Disconnect');
        //update sensor onConnect to false
        SensorData.updateMany({
            _id: {
              $in: items
            }
          }, {
            $set: {
              onConnect: false
            }
          }, {
            multi: true
          },
          (err, res) => {
            if(err) {
              console.log(err);
            } else {
              console.log("update success");
            }
          });
      } else {
        // console.log("no sensor disconnect");
      }
      //console.log("result :"+items);
    })
    .catch(err => {
      console.log(err);
      return err
    });
}
var searchAllSensor = (callback) => {
  SensorData.find()
    .select("name date _id value expireTime type")
    .exec()
    .then(docs => {
      //console.log(docs);
      var doc;
      var number = 0;
      var response = {

        count: docs.length,
        data: docs.map(doc => {

          return {
            _id: doc._id,
            date: moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'),
            name: doc.name,
            value: doc.value,
            onConnect: checkExpire(doc.date, parseInt(doc.expireTime)),
            expireTime: doc.expireTime,
            type: doc.type
            //line: countLine(number+=1)
          };
        })
      };
      callback(response);
      return;
    })
}
var searchSensorByID = (sensorID) => {
  return SensorData.find({
    _id: ObjectId(sensorID)
  }).select('name type onConnect value').exec();
}
var searchOneSensor_byID = (sensorID) => {
  return SensorData.findOne({
    _id: ObjectId(sensorID)
  }).exec();
}
var searchOneSensor_byName = (sensorName) => {
  return SensorData.findOne({
    "name": sensorName
  }).exec();
}
var searchMultiSensorPubCondition_byID = (docs) => {
  var ids = docs.map(doc => {
    return ObjectId(doc.sensorID);
  });
  console.log(ids);
  ids = [].concat.apply([], ids);
  console.log(ids);
  return SensorData.find({
    _id: {
      $in: ids
    }
  }).select('_id publishCondition').exec();
}
var updateMultiSensor_PubCondition = (docs) => {
  //initial multiple "updateOne" operation array
  var operations = docs.map(doc => {
    return {
      "updateOne": {
        "filter": {
          "_id": doc.sensorID
        },
        "update": {
          "$set": {
            "publishCondition": doc.condition
          }
        }
      }
    }
  });
  //Performs multiple operations with controls for order of execution
  SensorData.bulkWrite(operations, {
      "ordered": true,
      w: 1
    })
    .then(result => console.log("update multiple sensor publish condition success!"))
    .catch(err => console.log(err));
}
var getAllSensor = () => {
  return SensorData.find()
    .select('name value type onConnect')
    .exec();
}

module.exports = {
  checkDisconnect,
  searchAllSensor,
  searchSensorByID,
  searchOneSensor_byName,
  searchOneSensor_byID,
  searchMultiSensorPubCondition_byID,
  updateMultiSensor_PubCondition,
  getAllSensor
};