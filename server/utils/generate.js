var generateSensorData = (data) => {
  return {
    _id: data._id,
    name:data.name,
    temp: data.temp,
    date: data.date,
    onConnect: data.onConnect
  };
};

module.exports = {generateSensorData};
