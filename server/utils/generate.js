var generateData = (data) => {
  return {
    _id: data._id,
    name:data.name,
    temp: data.temp,
    date: data.date
  };
};

module.exports = {generateData};
