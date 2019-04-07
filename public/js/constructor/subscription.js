function Subscription() {
  this.subscriptions = [];
  //adding normal single subscription
  this.addOneSubscription = function(doc) {
    var sub = doc;
    this.subscriptions.push(sub);
    return;
  };
  this.removeOneSubscription = function(index) {
    this.subscriptions.splice(index, 1);
  }
  //getting a subscription's info
  this.getOneSubscription = function(index) {
    return this.subscriptions[index];
  }
  //update a subscription's info
  this.updateOneSubscription = function(index, doc) {
    if(doc.option) {
      this.subscriptions[index].option = doc.option;
      this.subscriptions[index].condition = doc.condition;
    } else if(doc.groupType) {
      this.subscriptions[index].groupType = doc.groupType;
      this.subscriptions[index].condition = doc.condition;
    }
  }
  this.findSensorDuplicate = function(id) {
    for(let i = 0; i < this.subscriptions.length; i++) {
      var result = this.subscriptions[i]._sensorID.find(sensorID => {
        return sensorID == id;
      });
      if(result !== undefined) {
        return result;
      }
    }
    // var result = this.subscriptions.find(subscription => {
    //   return subscription._sensorID == id;
    // });
    return result;
  }
  this.clear = function() {
    this.subscriptions = [];
    return;
  }
  // find the group 's index
  this.findGroupIndex = function(groupTitle) {
    var index = this.subscriptions.findIndex(subscrition => {
      return subscrition.groupTitle !== undefined &&
        groupTitle == subscrition.groupTitle;
    });
    return index;
  }
  //return all group title
  this.findAllGroupTitle = function() {
    var result = this.subscriptions.filter(subscription => {
        return subscription.groupType == "AND" || subscription.groupType == "OR"
      })
      .map(res => res.groupTitle);

    return result;
  }
  this.getAllSubscription = function() {
    return this.subscriptions;
  }
  // remove a sensor from the group
  this.removeFromGroup = function(subIndex, sensorIndex) {
    this.subscriptions[subIndex]._sensorID.splice(sensorIndex, 1);
  }
  //adding new sensor with groupType = (AND || OR)
  this.addToGroup = function(doc) {
    var index = this.findGroupIndex(doc.groupTitle);
    //if found the group had exist
    if(index > -1) {
      //add the sensor to this group
      let sensorIDArray = this.subscriptions[index]._sensorID;
      sensorIDArray.push(doc._sensorID[0]);
      let sensorNameArray = this.subscriptions[index].sensorName;
      sensorNameArray.push(doc.sensorName[0]);
      let newDoc = {
        groupType: doc.groupType,
        option: doc.option,
        groupTitle: doc.groupTitle,
        _sensorID: sensorIDArray,
        sensorName: sensorNameArray,
        condition: doc.condition,
        description: doc.description
      }; //update the subscription
      this.subscriptions[index] = newDoc;
    } else { //create a new subscription
      this.addOneSubscription(doc);
    }
    return;
  }
}