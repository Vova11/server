const { db } = require('../db/models');
const { Order, OrderItem, Product } = db.sequelize.models;
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { checkPermissions } = require('../utils');

//fake Strie API
const fakeStripeApi = ({ amount, currency }) => {
	const client_secret = 'someRandomValue';
	return { client_secret, amount };
};

// STRIPE PAYMENT
// const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// const stripeAPI = async ({ amount, currency }) => {
// 	const paymentIntent = await stripe.paymentIntents.create({
// 		amount,
// 		currency,
// 		automatic_payment_methods: {
// 			enabled: true,
// 		},
// 	});

// 	return { client_secret: paymentIntent.client_secret, amount };
// };

const calculateTotal = (shippingFee, subtotal) => {
	let updatedShippingFee = shippingFee;
	let totalValue = 0;

	if (subtotal > 50) {
		updatedShippingFee = 0;
	}

	totalValue = updatedShippingFee + subtotal;

	return { totalValue, updatedShippingFee };
};

const createOrder = async (req, res) => {
	const { items: cartItems, shippingFee } = req.body;

	if (!cartItems || cartItems.length < 1) {
		throw new CustomError.BadRequestError('No cart items provided!');
	}
	if (!shippingFee) {
		throw new CustomError.BadRequestError('Please provide shipping fee!');
	}
	let orderItems = [];
	let subtotal = 0;
	for (const item of cartItems) {
		console.log(item);
		const dbProduct = await Product.findByPk(item.product);
		if (!dbProduct) {
			throw new CustomError.NotFoundError(`No product with ${item.product}.`);
		}

		const { name, price, image } = dbProduct;
		const orderItem = {
			amount: item.amount,
			name,
			price,
			image,
			productId: item.product,
		};
		// add item to order
		orderItems = [...orderItems, orderItem];
		// calculate subtotal
		subtotal += item.amount * price;
		// calculate total
	}
	const { totalValue, updatedShippingFee } = calculateTotal(
		shippingFee,
		subtotal
	);

	// FAKE STRIPE FOR DEVELOPMENT with POSTMAN
	const paymentIntent = await fakeStripeApi({
		amount: totalValue,
		currency: 'eur',
	});

	// get client secret PROD CODE
	// const paymentIntent = await stripeAPI({
	// 	amount: total,
	// 	currency: 'eur',
	// });

	const order = await Order.create(
		{
			total: totalValue,
			subtotal,
			shippingFee: updatedShippingFee,
			clientSecret: paymentIntent.client_secret,
			user: req.user?.id || null,
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
		clientSecret: order.clientSecret,
	});
};

const getAllOrders = async (req, res) => {
	const orders = await Order.findAndCountAll();
	res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
	const order = await Order.findByPk(req.params.id);
	if (!order) {
		throw new CustomError.NotFoundError('Order not found.');
	}
	checkPermissions(req.user, order.user);
	res.status(StatusCodes.OK).json({ order });
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

module.exports = {
	getAllOrders,
	getSingleOrder,
	getCurrentUserOrders,
	createOrder,
	updateOrder,
};
