var SensorData = require('../model/sensor');
var moment = require('moment');
const {checkExpire} = require('../server/utils/checkExpire');
var ObjectId = require('mongodb').ObjectID;
// const {countLine} = require('../server/utils/countLine');
var io = require('socket.io-client');
var expireDate;
var checkDisconnect = () => {
  var sensor_is_disconnect = [];
  var currentDate = new Date();
  SensorData.find({
    onConnect:true,
    $where:function() {
      return new Date() > this.expireDate;
    }
  })
    .select("_id")
    .exec()
    .then(result => {
      if(result && result != "")
      {
        console.log("Sensor Disconnect: "+result);
        var items = [];
        for(var i = 0; i < result.length;i++) {
          items.push(result[i]._id);
        }
        // notification server
        var socket = io('http://localhost:3000');
        socket.emit('sensor disconnect', {disconnect_SID:items});
        console.log('emit an event to server about Sensor Disconnect');
        //update sensor onConnect to false
        SensorData.updateMany(
          { _id:{ $in: items} },
          { $set: { onConnect : false} },
          { multi:true },
          (err, res) => {
              if(err) {
                console.log(err);
              }
              else {
                console.log("update success");
              }
          });
      }
      else {
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
    .select("name date _id temp expireTime type")
    .exec()
    .then(docs => {
      //console.log(docs);
      var doc;
      var number = 0;
      var response = {

        count: docs.length,
        data: docs.map(doc => {

          return  {
            _id: doc._id,
            date: moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'),
            name: doc.name,
            temp: doc.temp,
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
  return SensorData.find({_id:ObjectId(sensorID)}).select('name type onConnect temp').exec();
}

module.exports = {checkDisconnect,searchAllSensor,searchSensorByID};
