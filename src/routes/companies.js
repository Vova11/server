const express = require('express')
const router = express.Router()
const {
  getAllCompanies,
  getCompanyProducts,
  getCompanyById,
  updateCompany,
  removeImage,
} = require('../controllers/companies')

router.route('/').get(getAllCompanies)

router.route('/:id/update').post(updateCompany)
router.route('/:id/removeImage').post(removeImage)
router.route('/:brandName').get(getCompanyProducts)
router.route('/:id').get(getCompanyById)




module.exports = router
