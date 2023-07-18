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
	.post([authenticateUser, authorizePermissions('admin')], createProduct);
router
	.route('/uploadImage')
	.post([authenticateUser, authorizePermissions('admin')], uploadImage);
router
	.route('/removeImage')
	.post([authenticateUser, authorizePermissions('admin')], removeImage);

router
	.route('/uploadMultipleImages')
	.post(
		[authenticateUser, authorizePermissions('admin')],
		uploadMultipleImages
	);

router
	.route('/publish/:id')
	.patch([authenticateUser, authorizePermissions('admin')], publishProduct);
router
	.route('/featured/:id')
	.patch([authenticateUser, authorizePermissions('admin')], featureProduct);

router
	.route('/:id')
	.get(getProductById)
	.patch(updateProduct)
	.delete([authenticateUser, authorizePermissions('admin')], deleteProduct);

module.exports = router;
