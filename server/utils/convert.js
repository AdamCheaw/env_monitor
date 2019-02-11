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

var mapToLogMsg = (data) => {
  var result = "";
  if(data.option) {
    result += `option : ${data.option} <br>`;
  }
  else if(data.groupType) {
    result += `grouping type : ${data.groupType} <br>`;
  }
  if(data.condition.length > 0){
    result += "condition : ";
    data.condition.forEach(item => {
      switch (true) {
        case item.type == "max":
          result += `<br> - greater than ${item.value}`;
          break;
        case item.type == "min":
          result += `<br> - lower than ${item.value}`;
          break;
        case item.type == "equal":
          result += `<br> - equal to ${item.value}`;
          break;
        case item.type == "between":
          result += `<br> - between to  ${item.minValue} ~ ${item.maxValue}`;
          break;
      }

    });
  }
  return result;
}

module.exports = {convertCondition , mapToLogMsg};
