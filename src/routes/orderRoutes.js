const express = require('express');
const router = express.Router();
const {
	getAllOrders,
	getSingleOrder,
	getCurrentUserOrders,
	createOrder,
	updateOrder,
} = require('../controllers/orderController');
const {
	loadPayment,
	goToEternalWebsite,
} = require('../controllers/paymentGateway');
const {
	authenticateUser,
	authorizePermissions,
} = require('../middleware/authhentication');

router
	.route('/')
	.post(createOrder)
	.get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router.route('/redirectMe').get(goToEternalWebsite);

router
	.route('/showAllMyOrders')
	.get([authenticateUser, authorizePermissions], getCurrentUserOrders);

router
	.route('/:id')
	.get(authenticateUser, authorizePermissions('admin'), getSingleOrder)
	.patch([authenticateUser, authorizePermissions('admin')], updateOrder);

router.route('/pay').post(loadPayment);

module.exports = router;
