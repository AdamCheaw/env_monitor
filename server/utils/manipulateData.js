const destructureSubCondition = (subscriptions) => {
  var results = [];
  subscriptions.forEach(doc => {
    if(doc.option === "advanced"){//advanced
      if((typeof doc.groupType === 'undefined')) {//not group
        results.push({
          sensorID: doc._sensorID[0],
          condition: doc.condition
        });
      }
      else {
        doc._sensorID.forEach(sensorID => {//group
          results.push({
            sensorID: sensorID,
            condition: doc.condition
          });
        });
      }
    }
    else {//default
      results.push({
        sensorID: doc._sensorID[0],
        condition: []
      });
    }
  });
  return results;
};

module.exports = {
  destructureSubCondition
};
