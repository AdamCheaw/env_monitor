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
        if(condition[i].type == "max" && sensorValue > parseInt(condition[i].value)) {
          value = new hbs.SafeString(
            '<span class="font-warning"><i class="icon-warning-sign"></i> '
            + sensorValue
            + '</span>');
          break;
        }
        else if (condition[i].type == "min" && sensorValue < parseInt(condition[i].value)) {
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
    return value
  }
}
