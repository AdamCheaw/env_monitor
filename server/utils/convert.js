var convertCondition = (data) => {
  var result = [];
  data.forEach(item => {
    if(item.type == "max" || item.type == "min"){
      result.push({type:item.type, value:parseInt(item.value)});
    }
    else {
      result.push({type:item.type, value:item.value});
    }
  });
  return result;
};

module.exports = {convertCondition};
