const { db } = require('../db/models');
const { Order, OrderItem, Product } = db.sequelize.models;
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { checkPermissions } = require('../utils');
const axios = require('axios');
const xml2js = require('xml2js');

const calculateTotal = (shippingFee, subtotal) => {
	let updatedShippingFee = shippingFee;
	let totalValue = 0;

	if (subtotal > 30) {
		updatedShippingFee = 0;
	}

	totalValue = updatedShippingFee + subtotal;

	return { totalValue, updatedShippingFee };
};

function lowercaseFirstLetter(str) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

function lowercaseFirstLetterKeys(obj) {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => lowercaseFirstLetterKeys(item));
	}

	const result = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const lowercaseKey = lowercaseFirstLetter(key);
			result[lowercaseKey] = lowercaseFirstLetterKeys(obj[key]);
		}
	}
	return result;
}
const createOrder = async (req, res) => {
	const { orderData, cartItems, shipping_fee } = req.body;
	console.log('Teraz robim order.......');
	const lowercaseFirstLetterOrderData = lowercaseFirstLetterKeys(orderData);
	try {
		if (!cartItems || cartItems.length < 1) {
			throw new CustomError.BadRequestError('No cart items provided!');
		}
		// if (!shipping_fee) {
		// 	throw new CustomError.BadRequestError('Please provide shipping fee!');
		// }

		let orderItems = [];
		let subtotal = 0;
		for (const item of cartItems) {
			const dbProduct = await Product.findByPk(item.productId);
			if (!dbProduct) {
				throw new CustomError.NotFoundError(`No product with ${item.product}.`);
			}

			const { name, price, image } = dbProduct;
			const orderItem = {
				amount: item.amount,
				name,
				price,
				image,
				productId: item.productId,
			};
			// add item to order
			orderItems = [...orderItems, orderItem];
			// calculate subtotal
			subtotal += item.amount * price;
		}
		// calculate total
		const { totalValue, updatedShippingFee } = calculateTotal(
			shipping_fee,
			subtotal
		);

		const order = await Order.create(
			{
				total: totalValue,
				subtotal,
				shippingFee: updatedShippingFee,
				...lowercaseFirstLetterOrderData,
				userId: req.user?.id || null,
				orderItems,
			},
			{
				include: [
					{
						model: OrderItem,
						as: 'orderItems',
					},
				],
			}
		);

		res.status(StatusCodes.CREATED).json({
			order,
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: 'An error occurred while creating the order.',
		});
	}
};

const getAllOrders = async (req, res) => {
	const orders = await Order.findAndCountAll({
		attributes: [
			'id',
			'status',
			'total',
			'subtotal',
			'shippingFee',
			'createdAt',
		],
	});
	res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
	const order = await Order.findByPk(req.params.id, {
		include: [
			// Include the associated OrderItem model
			{
				model: OrderItem,
				as: 'orderItems', // This should match the alias used in your Order model
			},
		],
	});
	if (!order) {
		throw new CustomError.NotFoundError('Order not found.');
	}
	// checkPermissions(req.user, order.user); //FIX THIS for admin and user
	res.status(StatusCodes.OK).json(order);
};

const getCurrentUserOrders = async (req, res) => {
	const { count, rows: orders } = await Order.findAndCountAll({
		where: {
			user: req.user.id,
		},
		include: [
			{
				model: OrderItem,
				as: 'orderItems',
			},
		],
	});

	if (!orders) {
		throw new CustomError.NotFoundError('Orders for user not found.');
	}
	res.status(StatusCodes.OK).json({ count, orders });
};

const updateOrderStatus = async (req, res) => {
	const { msTxnId, newStatus } = req.body;
	try {
		const order = await Order.findOne({
			where: {
				msTxnId,
			},
		});
		if (!order) {
			throw new CustomError.NotFoundError('Order not found.');
		}
		// pending', 'failed', 'paid',

		// Map newStatus to the corresponding status text based on your logic
		let mappedStatus;
		switch (newStatus) {
			case 'OK':
				mappedStatus = 'paid';
				break;
			case 'FAIL':
				mappedStatus = 'failed';
				break;
			case 'PENDING':
				mappedStatus = 'pending';
				break;
			default:
				// Handle other cases or set a default status if needed
				mappedStatus = 'pending';
		}

		order.status = mappedStatus;
		// Save the updated order
		await order.save();
		res.status(StatusCodes.OK).send({ msg: 'success' });
	} catch (error) {
		res.status(200).send({ msg: 'fail' });
	}
};

const updateOrder = async (req, res) => {
	const { id: orderId } = req.params;
	const { paymentIntendId } = req.body;

	const order = await Order.findByPk(orderId);
	if (!order) {
		throw new CustomError.NotFoundError('Order not found.');
	}
	checkPermissions(req.user, order.user); // FIX logic after implementing FRONT-END
	order.paymentIntentId = paymentIntendId;
	order.status = 'paid';
	await order.save();
	res.status(StatusCodes.OK).json({ order });
};

const deleteOrder = async (req, res) => {
	try {
		const orderId = req.params.orderId;

		// Use Sequelize to find the order by its primary key (orderId)
		const order = await Order.findByPk(orderId);

		if (!order) {
			return res.status(404).json({ error: 'Order not found' });
		}

		// Delete the order
		await order.destroy();

		// Respond with a success message
		res.status(200).json({ message: 'Order deleted successfully' });
	} catch (error) {
		console.error('Error deleting order:', error);
		res.status(500).json({ error: 'Failed to delete order' });
	}
};

const packeta = async (req, res) => {
	const { data } = req.body;
	const apiPassword = '9f1d27c6f56c4755a92ccafce7111291';

	try {
		const response = await axios.post(
			'http://www.zasilkovna.cz/api/soap.wsdl',
			data,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiPassword}`,
				},
			}
		);

		// Parse the XML response into a JavaScript object
		const parser = new xml2js.Parser();
		parser.parseString(response.data, (err, result) => {
			if (err) {
				console.error(err);
				res.status(500).send('Error parsing XML response');
			} else {
				// Access the data in the parsed object
				const packetery = result.definitions;
				res.status(200).json(packetery);
			}
		});
		// res.status(200).json(response.data);
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	getAllOrders,
	getSingleOrder,
	getCurrentUserOrders,
	createOrder,
	updateOrder,
	updateOrderStatus,
	deleteOrder,
	packeta,
};
