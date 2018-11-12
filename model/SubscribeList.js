
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Sensors',{ useNewUrlParser:true });
var Schema = mongoose.Schema;
var SubscribeListSchema = new mongoose.Schema({

  _sensorID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SensorData'
  },
  _subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  subscriberName: {type: String, required: true},
  socketID: {type: String},
  option: {type: String,default: 'default'},
  condition: {type: Schema.Types.Mixed},
  previousValue :{type: Number,default: null}
  // user_list: [{
  //   _id:false,
  //   socketID:{type: String,required: true},
  //   option:{type: String,default: 'default'}
  // }]
},{collection: 'SubscribeList'});
module.exports = mongoose.model('SubscribeList', SubscribeListSchema);
//console.log();
