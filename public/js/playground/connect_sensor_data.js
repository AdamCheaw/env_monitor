var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Sensors',{ useNewUrlParser:true });
var Schema = mongoose.Schema;
var sensorDataSchema = new Schema({
  name: {type: String, required: true},
  temp: {type: String, requires: true},
  date: {type: Date, requires: true}
},{collection: 'sensor-data'});

module.exports = mongoose.model('SensorData', sensorDataSchema);
