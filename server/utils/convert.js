var convertCondition = (data) => {
  var result = [];
  if (data) {
    data.forEach(item => {
      if(item.type == "max" || item.type == "min" || item.type == "equal"){
        result.push({type:item.type, value:Number(item.value)});
      }
      else if (item.type == "between"){
        result.push({
          type:item.type,
          minValue:Number(item.minValue),
          maxValue:Number(item.maxValue),
        })
      }
      else {
        result.push({type:item.type, value:item.value});
      }
    });
  }
  return result;
};

module.exports = {convertCondition};
