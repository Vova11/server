const express = require('express');
const router = express.Router();
const {
	getAllProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
} = require('../controllers/productsController');

const {
	uploadImage,
	uploadMultipleImages,
	removeImage,
	removeImageOnUpdate,
} = require('../controllers/imageUploadController');
router.route('/').get(getAllProducts).post(createProduct);
router.route('/uploadImage').post(uploadImage);
router.route('/removeImage').post(removeImage);
router.route('/removeImageOnUpdate').post(removeImageOnUpdate);
router.route('/uploadMultipleImages').post(uploadMultipleImages);

router
	.route('/:id')
	.get(getProductById)
	.patch(updateProduct)
	.delete(deleteProduct);

module.exports = router;
