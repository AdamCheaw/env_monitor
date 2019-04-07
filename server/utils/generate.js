var generateSensorData = (data, subInfo) => {
  return {
    _id: data._id,
    name: data.name,
    value: data.value,
    date: data.date,
    onConnect: data.onConnect,
    option: subInfo.option,
    condition: subInfo.condition
  };
};
var generateNotification = (data) => {
  return {
    _id: data._id,
    option: data.option,
    condition: data.condition,
    groupType: data.groupType,
    _sensorID: data._sensorID.map(sensor => {
      return {
        _id: sensor._id,
        value: sensor.value,
        onConnect: sensor.onConnect,
        date: sensor.date,
      };
    })
  };
}
var generateSensorDisconnectData = (doc, sensorID) => {
  return {
    _id: doc._id,
    groupType: doc.groupType,
    sensorID: sensorID
  }
}
module.exports = {
  generateSensorData,
  generateNotification,
  generateSensorDisconnectData
};