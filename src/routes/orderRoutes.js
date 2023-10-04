const express = require('express');
const router = express.Router();
const {
	getAllOrders,
	getSingleOrder,
	getCurrentUserOrders,
	createOrder,
	updateOrder,
	updateOrderStatus,
	deleteOrder,
	packeta,
} = require('../controllers/orderController');
const {
	createPdf,
	fetchPdf,
	confirmOrder,
} = require('../controllers/generatePdf');
const { paymentgw } = require('../controllers/paymentGateway');
const {
	authenticateUser,
	authorizePermissions,
} = require('../middleware/authhentication');

router
	.route('/')
	.post(createOrder)
	.get(authenticateUser, authorizePermissions('admin', 'user'), getAllOrders);

router.route('/updateOrderStatus').post(updateOrderStatus);
router.route('/paymentgw').post(paymentgw);

router
	.route('/showAllMyOrders')
	.get([authenticateUser, authorizePermissions], getCurrentUserOrders);

router
	.route('/create-pdf')
	.post(authenticateUser, authorizePermissions('admin', 'user'), createPdf);
router.route('/packeta').post(packeta);

router
	.route('/fetch-pdf/:invoiceFileName')
	.get(authenticateUser, authorizePermissions('admin', 'user'), fetchPdf);
router
	.route('/send-confirmation-email')
	.post(authenticateUser, authorizePermissions('admin', 'user'), confirmOrder);

router
	.route('/:orderId')
	.delete(authenticateUser, authorizePermissions('admin', 'user'), deleteOrder);

router
	.route('/:id')
	.get(authenticateUser, authorizePermissions('admin', 'user'), getSingleOrder)
	.patch(authenticateUser, authorizePermissions('admin'), updateOrder);

module.exports = router;
