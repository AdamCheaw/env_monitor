var SensorData = require('../model/sensor');
var moment = require('moment');
const {checkExpire} = require('../server/utils/checkExpire');

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
var searchAllSensor = (callback) => {
  SensorData.find()
    .select("name date _id temp expireTime")
    .exec()
    .then(docs => {
      //console.log(docs);
      var doc;
      var response = {

        count: docs.length,
        data: docs.map(doc => {
          return  {
            _id: doc._id,
            date: moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a'),
            name: doc.name,
            temp: doc.temp,
            onConnect: checkExpire(doc.date, parseInt(doc.expireTime)),
            expireTime: doc.expireTime
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
