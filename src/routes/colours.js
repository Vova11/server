const express = require('express');
const router = express.Router();
const { create } = require('../controllers/coloursController');

router.route('/').post(create);
module.exports = router;
