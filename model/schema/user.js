var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Sensors',{ useNewUrlParser:true });
var Schema = mongoose.Schema;
var UserSchema = new mongoose.Schema({
  name: {type: String, required: true},
  onConnect: {type: Boolean, requires: true},
  socketID: {type: String}
},{collection: 'User'});

module.exports = mongoose.model('User', UserSchema);
