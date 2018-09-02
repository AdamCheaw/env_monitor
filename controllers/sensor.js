var SensorData = require('../model/sensor');
var moment = require('moment');

var expireDate;
var checkDisconnect = (callback) => {
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
    //find disconnect sensor and callback
    .then(docs => {
      if(docs && docs != "")
      {
        callback(docs);
        return docs;
      }
      else {
        callback();
        return;
      }
    })
    //according to result (sensor._id) change the onConnect to false
    .then(result => {
      if(result && result != "")
      {
        var items = [];
        for(var i = 0; i < result.length;i++) {
          items.push(result[i]._id);
        }
        SensorData.update(
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
      //console.log("result :"+items);
    })
    .catch(err => {
      console.log(err);
      return err
    });
}

module.exports = {checkDisconnect};
