var moment = require('moment');

var checkExpire = (date, expireTime) => {
  var currentDate = new Date();
  var expireDate = moment(date).add(expireTime, 's');

  //moment.parseZone(doc.date).local().format('YYYY MMM Do h:mm:ss a')
  if(currentDate < expireDate){
    expireDate = moment.parseZone(expireDate).local().format('YYYY MMM Do h:mm:ss a');
    currentDate = moment.parseZone(currentDate).local().format('YYYY MMM Do h:mm:ss a');
    // console.log("Date: "+expireTime);
    // console.log("expireDate: "+expireDate);
    return true;
  }
  else {
    expireDate = moment.parseZone(expireDate).local().format('YYYY MMM Do h:mm:ss a');
    currentDate = moment.parseZone(currentDate).local().format('YYYY MMM Do h:mm:ss a');
    // console.log("Date: "+currentDate);
    // console.log("expireDate: "+expireDate);
    return false;
  }
};
module.exports = {checkExpire};
