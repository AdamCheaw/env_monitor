var generateSensorData = (data,subInfo) => {
  return {
    _id: data._id,
    name: data.name,
    temp: data.temp,
    date: data.date,
    onConnect: data.onConnect,
    option: subInfo.option,
    condition: subInfo.condition
  };
};
var generateNotification = (data) => {
  return {
    _id: data.name,
    option: data.option,
    condition: data.condition,
    _sensorID: data._sensorID.map(sensor => {
      return {
        _id: sensor._id,
        temp: sensor.temp,
        date: sensor.date
      };
    })
  };
}

module.exports = {generateSensorData , generateNotification};
