//mapping sensor value with condition to finding match or not
const mappingCondition = (condition, sensorValue) => {
  for(let i = 0; i < condition.length; i++) {
    if(condition[i].type == "greater" &&
      Number(sensorValue) > Number(condition[i].value)) {
      return true;
    } else if(condition[i].type == "lower" &&
      Number(sensorValue) < Number(condition[i].value)) {
      return true;
    } else if(condition[i].type == "precision") {
      return true;
    } else if(condition[i].type == "equal" &&
      Number(sensorValue) == Number(condition[i].value)) {
      return true;
    } else if(condition[i].type == "between" &&
      (Number(sensorValue) > Number(condition[i].minValue) &&
        Number(sensorValue) < Number(condition[i].maxValue)
      )
    ) {
      return true;
    }
  }
  return false;
}
//change value font color by condition
const changeValueFontColor = (option, value, condition) => {
  let valueTag;
  if(option == "default") { //subscription is default
    valueTag = `<span class="font-blue">${value}<span>`;
  } else if(option == "advanced") { //subscription is advanced
    if(mappingCondition(condition, value)) { //current sensor value is match condition
      valueTag = `<span class="font-warning">${value}<span>`;
    } else { //current sensor value not match condition
      valueTag = `<span class="font-safe">${value}<span>`;
    }
  }
  return valueTag;
}

//display data by show a modal
const generateDataDisplayModalHTML = (scriptHtml, doc) => {
  console.log(doc._sensorID);
  let template = Handlebars.compile(scriptHtml);
  let obj = {
    title: "test",
    option: doc.option,
    sensor: doc._sensorID.map(sensor => {
      return {
        name: sensor.name,
        type: sensor.type,
        value: changeValueFontColor(doc.option, sensor.value, doc.condition),
        onConnect: sensor.onConnect
      }
    })
  };
  return template(obj);
}