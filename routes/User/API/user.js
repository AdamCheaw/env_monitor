const express = require('express');
const router = express.Router();

const UserController = require('../../../controller/API/user');

// url : {...}/API/authentication
//handle API user authentication
router.post('/', UserController.Authentication);

module.exports = router;