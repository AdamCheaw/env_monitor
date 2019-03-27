var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Sensors',{ useNewUrlParser:true });
var Schema = mongoose.Schema;
var sensorHistorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, requires: true },
  date: { type: Date, requires: true },
  _sensorID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SensorData'
  },
},{collection: 'sensorHistory'});

module.exports = mongoose.model('sensorHistory', sensorHistorySchema);
