const router = require('express').Router();
const { AdController } = require('../controllers');

router.get('/users', AdController.getUsers);

module.exports = router;