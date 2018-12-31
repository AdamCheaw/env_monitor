const { getSubscriptionInfo,updateSubscriptionInfo } = require('../../controllers/SubscribeList');

var GetSubscriptionInfo = (req, res, next) => {
  // console.log(req.body._id);
  getSubscriptionInfo(req.body._id)
    .then(doc => {
      if(doc && doc !== null && doc !== undefined) {
        res.json(doc);
      }
      else {
        res.status(400).json({msg:"nothing found"});
      }
    })
    .catch(err => {
      res.status(400).json({msg:err.message});
      console.log(err);
    });
  // mongoose.disconnect();
}
var UpdateSubscriptionInfo = (req, res, next) => {
  updateSubscriptionInfo(req.body)
   .then(result => {
     if(result) {
       res.json({msg:"ok!"});
     }
   })
   .catch(err => {
     res.status(400).json({msg:err.message});
   });  
}
module.exports = { GetSubscriptionInfo,UpdateSubscriptionInfo };
