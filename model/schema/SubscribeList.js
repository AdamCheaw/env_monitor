var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Sensors', { useNewUrlParser: true });
var Schema = mongoose.Schema;
var SubscribeListSchema = new mongoose.Schema({

  _sensorID: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SensorData'
  }],
  _subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  subscriberName: { type: String, required: true },
  description: { type: String },
  socketID: { type: String },
  option: { type: String, default: 'default' },
  condition: { type: Schema.Types.Mixed },
  //value decimal , 0 = integer , 1 = 1 decimal(0.6)
  decimal: { type: Number, default: 0 },
  //flag ,get to know previous is matching condition
  previousMatch: { type: Boolean, default: null },
  previousValue: { type: Number, default: null },
  groupType: { type: String, default: null },
  title: { type: String, required: true }
}, { collection: 'SubscribeList' });
SubscribeListSchema.set('timestamps', true);
module.exports = mongoose.model('SubscribeList', SubscribeListSchema);
//console.log();