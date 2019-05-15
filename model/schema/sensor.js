var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Sensors', { useNewUrlParser: true });
var Schema = mongoose.Schema;
var SensorDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, requires: true },
  date: { type: Date, requires: true },
  expireTime: { type: Number, default: 30, require: true },
  onConnect: { type: Boolean, requires: true },
  expireDate: { type: Date, requires: true },
  type: { type: String, requires: true },
  previousValue: { type: String },
  publishCondition: { type: Schema.Types.Mixed, default: [] },
  description: { type: String }
}, { collection: 'sensor-data' });

module.exports = mongoose.model('SensorData', SensorDataSchema);