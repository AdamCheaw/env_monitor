const express = require('express');
const router = express.Router();
const ObserveController = require("../../../controller/WEB/observe-page");
const SubLogController = require("../../../controller/WEB/subscriptionLog-page");
const {checkSession} = require("../../../server/checkAuth");

//GET user request real-time observe page
router.get('/', checkSession, ObserveController.ObserverPage);

//GET user request subscriptionLogs page
router.get('/viewLog', checkSession, SubLogController.ViewLogsPage);


module.exports = router;
