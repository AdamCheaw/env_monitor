var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Sensors',{ useNewUrlParser:true });
var Schema = mongoose.Schema;
var subscriptionLogsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  logMsg: { type: String },
  // -1 = some of the sensor not connnet, 0 = match condition,
  // 1 = back to normal or onConnect , 2 = subscriber manipulation subscription ,
  // 3 = created a subscription , 4 = deleted a subscription
  logStatus: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  _subscription: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SubscribeList'
  },
  _subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
},{collection: 'subscriptionLogs'});

module.exports = mongoose.model('subscriptionLogs', subscriptionLogsSchema);
