const express = require('express');
const router = express.Router();
const {
	getAllProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	publishProduct,
	featureProduct,
} = require('../controllers/productsController');

const {
	uploadImage,
	uploadMultipleImages,
	removeImage,
} = require('../controllers/imageUploadController');

const {
	authenticateUser,
	authorizePermissions,
} = require('../middleware/authhentication');

router
	.route('/')
	.get(getAllProducts)
	.post(
		[authenticateUser, authorizePermissions('admin', 'user')],
		createProduct
	);
router
	.route('/uploadImage')
	.post([authenticateUser, authorizePermissions('admin', 'user')], uploadImage);
router
	.route('/removeImage')
	.post([authenticateUser, authorizePermissions('admin', 'user')], removeImage);

router
	.route('/uploadMultipleImages')
	.post(
		[authenticateUser, authorizePermissions('admin', 'user')],
		uploadMultipleImages
	);

router
	.route('/publish/:id')
	.patch(
		[authenticateUser, authorizePermissions('admin', 'user')],
		publishProduct
	);
router
	.route('/featured/:id')
	.patch(
		[authenticateUser, authorizePermissions('admin', 'user')],
		featureProduct
	);

router
	.route('/:id')
	.get(getProductById)
	.patch(
		[authenticateUser, authorizePermissions('admin', 'user')],
		updateProduct
	)
	.delete(
		[authenticateUser, authorizePermissions('admin', 'user')],
		deleteProduct
	);

module.exports = router;
