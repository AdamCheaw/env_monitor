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

module.exports = {generateSensorData};
