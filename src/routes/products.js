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

const {
	authenticateUser,
	authorizePermissions,
} = require('../middleware/authhentication');

router
	.route('/')
	.get(getAllProducts)
	.post([authenticateUser, authorizePermissions('admin')], createProduct);
router
	.route('/uploadImage')
	.post([authenticateUser, authorizePermissions('admin')], uploadImage);
router
	.route('/removeImage')
	.post([authenticateUser, authorizePermissions('admin')], removeImage);
router
	.route('/removeImageOnUpdate')
	.post([authenticateUser, authorizePermissions('admin')], removeImageOnUpdate);
router
	.route('/uploadMultipleImages')
	.post(
		[authenticateUser, authorizePermissions('admin')],
		uploadMultipleImages
	);

router
	.route('/:id')
	.get(getProductById)
	.patch([authenticateUser, authorizePermissions('admin')], updateProduct)
	.delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

module.exports = router;
