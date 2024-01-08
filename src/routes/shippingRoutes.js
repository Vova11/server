const express = require('express')
const router = express.Router()

const {
  createPacketa,
  printPacketaLabel,
  infoAboutPacketa,
} = require('../controllers/shippingController')

router.route('/create-packeta').post(createPacketa)
router.route('/print-packeta-pdf').post(printPacketaLabel)
router.route('/packeta-status').post(infoAboutPacketa)

module.exports = router
