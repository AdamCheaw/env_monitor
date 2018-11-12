var hbs = require('handlebars');

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
            '<span class="font-warning"><i class="icon-warning-sign"></i> '
            + sensorValue
            + '</span>');
          break;
        }
        else if (condition[i].type == "min" && Number(sensorValue) < Number(condition[i].value)) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-warning-sign"></i> '
            + sensorValue
            + '</span>');
          break;
        }
        else if (condition[i].type == "precision") {
          value = sensorValue;
        }
        else {
          value = new hbs.SafeString(
            '<span class="font-safe"><i class="icon-star"></i></span>'
          );
        }
      }
    }
    else {
      value = sensorValue;
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
        result = `<img src="icon/warm.png" width="18px" height="18px"> &nbsp${type}`;
        break;
      case "volume":
        result = `<img src="icon/sound.png" width="18px" height="18px"> &nbsp${type}`;
        break;
      case "humidity":
        result = `<img src="icon/humidity.png" width="18px" height="18px"> &nbsp${type}`;
        break;
      case "pm2.5":
        result = `<img src="icon/cloud.png" width="18px" height="18px"> &nbsp${type}`;
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
  }
}
