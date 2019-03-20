


        {
          "name": "temp142",
          "type": "temperature",
          "coordinates": [41.40338, 2.17403],
          "value": 30
        }//registration msg

        {
          "type": "temperature",
          "value": 28
        }//publish msg

        [
          {
            "sensorID": ObjectId("507f1f77bcf86cd798545632"),
            "option" : "default"
          },
          {
            "sensorID": ObjectId("507f1f77bcf86cd795434646"),
            "option": "advanced",
            "condition": [{"type":"greater","value":25}]
          },
          {
            "subscriber": ObjectId("507f1f77bcf86cd743543212")
            "sensorID": [
                          ObjectId("507f1f77bcf86cd795434646"),
                          ObjectId("507f1f77bcf86cd795423112")
                        ],
            "option": "advanced",
            "groupType": "AND",
            "condition": [{
                            "type":"lower","value":25
                          },
                          {
                            "type":"equal","value":30
                          }]
          }//subscription
        ]

        {

        }
