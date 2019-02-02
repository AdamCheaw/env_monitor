var hbs = require('handlebars');
var moment = require('moment');
var filterByCondition = (condition,sensorValue) => {
  for(let i = 0;i < condition.length;i++) {
    if(condition[i].type == "max" && Number(sensorValue) > Number(condition[i].value)) {
      return true;
    }
    else if(condition[i].type == "min" && Number(sensorValue) < Number(condition[i].value)) {
      return true;
    }
    else if (condition[i].type == "precision") {
      return true;
    }
    else if (condition[i].type == "equal" && Number(sensorValue) == Number(condition[i].value)) {
      return true;
    }
    else if (condition[i].type == "between" &&
             ( Number(sensorValue) > Number(condition[i].minValue) &&
               Number(sensorValue) < Number(condition[i].maxValue)
             )
            )
    {
      return true;
    }

  }
  return false;
}
module.exports = {
  ifeq: function(a, b, options){
    if (a === b) {
      return options.fn(this);
      }
    return options.inverse(this);
  },
  bar: function(){
    return "BAR!";
  },
  loadValue: (sensorValue, option, condition) => {
    var value;
    if(option == "advanced") {
      for(var i = 0;i < condition.length;i++) {
        if(condition[i].type == "max" && Number(sensorValue) > Number(condition[i].value)) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-md icon-warning-sign"></i> '
            + sensorValue
            + '</span>');
          break;
        }
        else if (condition[i].type == "min" && Number(sensorValue) < Number(condition[i].value)) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-md icon-warning-sign"></i> '
            + sensorValue
            + '</span>');
          break;
        }
        else if (condition[i].type == "precision") {
          value = sensorValue;
        }
        else if (condition[i].type == "equal" && Number(sensorValue) == Number(condition[i].value)) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-md icon-warning-sign"></i> '
            + sensorValue
            + '</span>');
          break;
        }
        else if (condition[i].type == "between" &&
                 ( Number(sensorValue) > Number(condition[i].minValue) &&
                   Number(sensorValue) < Number(condition[i].maxValue)
                 )
                )
        {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-md icon-warning-sign"></i> '
            + sensorValue
            + '</span>');
          break;
        }
        else {
          value = new hbs.SafeString(
            '<span class="font-safe"><i class="icon-star"></i></span>'
          );
        }
      }
    }
    else {
      value = new hbs.SafeString(
        '<span class="font-blue">'
        + sensorValue
        + '</span>');
    }
    return value;
  },
  loadGroupValue: (sensors, groupType, condition) => {
    var value;
    if(groupType == "AND") {
      value = '<span class="font-warning"><i class="icon-warning-sign "></i></span>';
      //compare all sensor with multiple condition
      for(let i = 0;i < sensors.length;i++) {
        //if a single sensor disconnect , return noSafe mode
        if(!sensors[i].onConnect) {
          value = '<span class="font-warning"><i class="icon-warning-sign"></i></span>'
          break;
        }
        //if a single sensor did not match condition , return safe mode
        if(!filterByCondition(condition,sensors[i].temp)){
          value = '<span class="font-safe"><i class="icon-star "></i></span>';
          break;
        }
      }

    }
    else if(groupType == "OR") {
      value = '<span class="font-safe"><i class="icon-star "></i></span>';
      for(let i = 0;i < sensors.length;i++) {
        //if a single sensor disconnect , return noSafe mode
        if(!sensors[i].onConnect) {
          value = '<span class="font-warning"><i class="icon-warning-sign "></i></span>'
          break;
        }
        //if a single sensor match a condition , return noSafe mode
        if(filterByCondition(condition,sensors[i].temp)){
          value = '<span class="font-warning"><i class="icon-warning-sign "></i></span>';
          break;
        }
      }
    }
    return value;
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
      default: "xxxxx";
    }
    return result;
  },
  limitStr: function(str,start,last) {
    var res = str.substr(start, last);
    if(str.length > last)
    {
    	res += "..."
    }
    return res;
  },
  isGroup: function(value, options){
    if (value == "AND" || "OR") {
        return true;
    }
    return false;
  },
  loadLogMsg: function(logStatus,logMsg) {
    let msg;
    if(logStatus < 1) {
      msg = `<p class="font-warning">
                <i class="icon-md icon-warning-sign"></i>
                ${logMsg}
             </p>`;
    }
    else {
      msg = `<p class="font-safe">
                <i class="icon-md icon-ok"></i>
                ${logMsg}
             </p>`;
    }
    return msg;
  },
  // counting how many page can display for ViewLogPage
  howManyPage: function(total) {
    let page = total / 30;
    let select = "";
    for(let i = 0;i < page;i++) {
      //ex <option value="1">1</option>...

      select = select +`<li><a href="#">${i+1}</a></li>` ;
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
    for(let i = 1;i < 4;i++) {
      date = moment(dates[i-1]).subtract(12,'hours').utc().format();
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
