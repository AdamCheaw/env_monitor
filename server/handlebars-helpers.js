var hbs = require('handlebars');
var moment = require('moment');
const filterByCondition = (condition, sensorValue) => {
  for(let i = 0; i < condition.length; i++) {
    if(condition[i].type == "greater" && Number(sensorValue) > Number(condition[i].value)) {
      return true;
    } else if(condition[i].type == "lower" && Number(sensorValue) < Number(condition[i].value)) {
      return true;
    } else if(condition[i].type == "precision") {
      return true;
    } else if(condition[i].type == "equal" && Number(sensorValue) == Number(condition[i].value)) {
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
const mappingConditionToStr = (condition) => {
  if(condition.type == "greater") {
    return `greater than ${condition.value}`;
  } else if(condition.type == "lower") {
    return `lower than ${condition.value}`;
  } else if(condition.type == "equal") {
    return `equal to ${condition.value}`;
  } else if(condition.type == "precision") {} else if(condition.type == "between") {
    return `in between ${condition.minValue} ~ ${condition.maxValue}`;
  }
}

module.exports = {
  ifeq: function(a, b, options) {
    if(a === b) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  bar: function() {
    return "BAR!";
  },
  loadValue: (sensorValue, option, condition) => {
    var value;
    if(option == "advanced") {
      for(var i = 0; i < condition.length; i++) {
        if(condition[i].type == "greater" && Number(sensorValue) > Number(condition[i].value)) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-warning-sign"></i> ' +
            '</span>');
          break;
        } else if(condition[i].type == "lower" && Number(sensorValue) < Number(condition[i].value)) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-warning-sign"></i> ' +
            '</span>');
          break;
        } else if(condition[i].type == "precision") {
          value = sensorValue;
        } else if(condition[i].type == "equal" && Number(sensorValue) == Number(condition[i].value)) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-warning-sign"></i> ' +
            '</span>');
          break;
        } else if(condition[i].type == "between" &&
          (Number(sensorValue) > Number(condition[i].minValue) &&
            Number(sensorValue) < Number(condition[i].maxValue)
          )
        ) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-warning-sign"></i> ' +
            '</span>');
          break;
        } else {
          value = new hbs.SafeString(
            '<span class="font-safe"><i class="icon-star"></i></span>'
          );
        }
      }
    } //end advanced option
    else { // option = default
      value = new hbs.SafeString(
        '<span class="font-blue">' +
        sensorValue +
        '</span>');
    }
    return value;
  },
  loadGroupValue: (sensors, groupType, condition) => {
    var value;
    if(groupType == "AND") {
      let matchNum = 0;
      //compare all sensor with multiple condition
      for(let i = 0; i < sensors.length; i++) {
        //if a single sensor disconnect , return noSafe mode
        if(!sensors[i].onConnect) {
          value = '<div class="">' +
            '<span class="font-yellow"><i class="icon-question-sign"></i></span>' +
            '</div>';
          return new hbs.SafeString(value);
        }
        //if matching condition matchNum +1
        if(filterByCondition(condition, sensors[i].value)) {
          matchNum += 1;
        }
      }
      if(matchNum !== sensors.length) {
        value = '<div class="animated infinite slow bounceIn">' +
          '<span class="font-safe"><i class="icon-star "></i></span>' +
          '</div>';
      } else {
        value = '<div class="animated infinite slow bounceIn">' +
          '<span class="font-warning"><i class="icon-warning-sign "></i></span>' +
          '</div>';
      }
    } else if(groupType == "OR") {
      let matchNum = 0;
      for(let i = 0; i < sensors.length; i++) {
        //if a single sensor disconnect , return noSafe mode
        if(!sensors[i].onConnect) {
          value = '<div class="">' +
            '<span class="font-yellow"><i class="icon-question-sign"></i></span>' +
            '</div>';
          return new hbs.SafeString(value);
        }
        //if match a condition .matchNum +1
        if(filterByCondition(condition, sensors[i].value)) {
          matchNum += 1;
        }
      }
      if(matchNum > 0) {
        value = '<div class="animated infinite slow bounceIn">' +
          '<span class="font-warning"><i class="icon-warning-sign "></i></span>' +
          '</div>';
      } else {
        value = '<div class="animated infinite slow bounceIn">' +
          '<span class="font-safe"><i class="icon-star "></i></span>' +
          '</div>';
      }
    }
    value = new hbs.SafeString(value);
    return value
  },
  loadCondition: function(conditions) {
    var html = "";
    conditions.forEach((condition, index, arr) => {
      if(index == arr.length - 1) {
        html += mappingConditionToStr(condition);
      } else {
        html += mappingConditionToStr(condition) + " , ";
      }
    });
    return html;
  },
  toJSON: function(object) {
    return JSON.stringify(object);
  },
  findIcon: function(type) {
    var result;
    switch (type) {
      case "temperature":
        result = `<img src="/icon/warm.png" width="18px" height="18px"> &nbsp${type}`;
        break;
      case "volume":
        result = `<img src="/icon/sound.png" width="18px" height="18px"> &nbsp${type}`;
        break;
      case "humidity":
        result = `<img src="/icon/humidity.png" width="18px" height="18px"> &nbsp${type}`;
        break;
      case "pm2.5":
        result = `<img src="/icon/cloud.png" width="18px" height="18px"> &nbsp${type}`;
        break;
      default:
        "xxxxx";
    }
    return result;
  },
  limitStr: function(str, start, last) {
    if(str !== "" && str !== null && str !== undefined) {
      var res = str.substr(start, last);
      if(str.length > last) {
        res += "..."
      }
      return res;
    } else {
      return "no description..";
    }
  },
  isGroup: function(value, options) {
    if(value == "AND" || "OR") {
      return true;
    }
    return false;
  },
  loadLogMsg: function(logStatus, logMsg) {
    let msg;
    if(logStatus <= 0) { //match condition or disconnect
      msg = `<p class="font-warning">
                <i class="icon-md icon-warning-sign"></i>
                ${logMsg}
             </p>`;
    } else if(logStatus == 1) { //back to safe
      msg = `<p class="font-safe">
                <i class="icon-md icon-ok"></i>
                ${logMsg}
             </p>`;
    } else if(logStatus == 2) { //edit
      msg = `<p class="font-blue">
                <i class="icon-md icon-edit"></i>
                ${logMsg}
             </p>`;
    } else if(logStatus == 3) { //created
      msg = `<p class="font-blue">
                <i class="icon-md icon-pencil"></i>
                ${logMsg}
             </p>`;
    } else if(logStatus == 4) { //deleted
      msg = `<p class="font-warning">
                <i class="icon-md icon-remove"></i>
                ${logMsg}
             </p>`;
    }
    // else if(logStatus == -1) {
    //
    // }
    return msg;
  },
  // counting how many page can display for ViewLogPage
  howManyPage: function(total) {
    let page = total / 15;
    let select = "";
    for(let i = 0; i < page; i++) {
      //ex <option value="1">1</option>...

      select = select + `<li><a href="#">${i+1}</a></li>`;
    }
    return select;
  },
  loadSelectDate: function() {
    // var date1 = moment().hour(0).minute(0).second(0).utc().format();
    // var date2 = moment(date1).hour(12).utc().format();
    // var date3 = moment(date1).subtract(1,'days').utc().format();
    // var date4 = moment(date1).hour(12).subtract(1,'days').utc().format();
    var dates = [];
    var date = moment().hour(12).minute(0).second(0).utc().format();
    var option = "";
    dates.push(date);
    for(let i = 1; i < 4; i++) {
      date = moment(dates[i - 1]).subtract(12, 'hours').utc().format();
      dates.push(date);
    }
    option += `<option value='${dates[0]}'>today , 12pm ~ 12am</option>`;
    option += `<option value='${dates[1]}'>today , 12am ~ 12pm</option>`;
    option += `<option value='${dates[2]}'>yesterday , 12pm ~ 12am</option>`;
    option += `<option value='${dates[3]}'>yesterday , 12am ~ 12pm</option>`;
    //console.log(dates);
    return option;
  }
}