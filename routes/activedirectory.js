const router = require('express').Router();
const { AdController } = require('../controllers');

router.get('/users', AdController.getUsers);
router.post('/login', AdController.login);
router.post('/update-password', AdController.updatePassword);

module.exports = router;