const router = require('express').Router();
const adRoutes = require('./activedirectory');

router.use('/activedirectories', adRoutes);

module.exports = router;
