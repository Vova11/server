const express = require('express')
const router = express.Router()
const {
  contactEmail
} = require('../controllers/contactEmailController')

router
  .route('/contact-email')
  .post(contactEmail)

module.exports = router