var SensorData = require('../model/sensor');
var moment = require('moment');
const {checkExpire} = require('../server/utils/checkExpire');
const {countLine} = require('../server/utils/countLine');
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
    // //find disconnect sensor and callback
    // .then(docs => {
    //   if(docs && docs != "")
    //   {
    //     console.log("Sensor Disconnect: "+docs);
    //     var socket = io('http://localhost:3000');
    //     socket.emit('sensor disconnect', {disconnect_SID:docs});
    //     console.log('emit an event to server about Sensor Disconnect');
    //
    //     //return docs;
    //   }
    //   else {
    //     console.log("no sensor disconnect");
    //
    //   }
    // })
    //according to result (sensor._id) change the onConnect to false
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
        console.log("no sensor disconnect");
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
    .select("name date _id temp expireTime")
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
            //line: countLine(number+=1)
          };
        })
      };
      callback(response);
      return;
      //res.render('getAll',{items:response, session:req.session.views});

      //res.status(200).json(response.data[0].date);
      //console.log("From database", response);
    })
}

module.exports = {checkDisconnect,searchAllSensor};
