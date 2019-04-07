const ObjectId = require('mongodb').ObjectID;

function PublishCondition() {
  this.pubCondition = new Map(); //define a Map data structure
  this.addPublishCondition = (docs) => {
    docs.forEach(doc => {
      //convert a objectID to a string
      let id = ObjectId(doc.sensorID).toString();
      //add or update with exist key in the Map
      this.pubCondition.set(id, doc.condition);
    });
    return;
  }
  //pull out a publish condition value from the Map and return it
  this.getPublishCondition_byID = (sensorID) => {
    //convert a objectID to a string
    let id = ObjectId(sensorID).toString();
    if (this.pubCondition.has(id)) { //check id is exist
      //get the value by key
      console.log("sensor is exist!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      let result = this.pubCondition.get(id);
      this.pubCondition.delete(id);
      return result;
    }
    return null;
  }
  this.show = () => {
    return this.pubCondition;
  }
}

module.exports = {
  PublishCondition
}