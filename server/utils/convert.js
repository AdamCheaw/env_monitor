var convertCondition = (data) => {
  var result = [];
  if (data) {
    data.forEach(item => {
      if(item.type == "max" || item.type == "min"){
        result.push({type:item.type, value:Number(item.value)});
      }
      else {
        result.push({type:item.type, value:item.value});
      }
    });
  }
  return result;
};

module.exports = {convertCondition};
