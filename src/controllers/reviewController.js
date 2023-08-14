const { Op, Sequelize } = require('sequelize');

const { db } = require('../db/models');
const { Review, User, Product } = db.sequelize.models;

const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
	const { productId } = req.body;

	const isValidProduct = await Product.findByPk(productId);

	if (!isValidProduct) {
		// throw new ErrorCustomError.NotFoundError('No product found');
		console.log('product not found');
	}

	const alreadySubmitted = await Review.findOne({
		where: {
			productId: productId,
			userId: req.user.id,
			[Sequelize.Op.and]: [{ productId: productId }, { userId: req.user.id }],
		},
	});
	if (alreadySubmitted) {
		// throw new CustomError.BadRequestError(
		// 	'User already has review for product'
		// );
		console.log('User already has review for product');
	}
	req.body.userId = req.user.id;
	const review = await Review.create(req.body);
	res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
	const reviews = await Review.findAndCountAll({
		include: [
			{
				model: User,
				as: 'user',
				attributes: ['firstName', 'email'],
			},
			{
				model: Product,
				as: 'product',
				attributes: ['name', 'price', 'inventory', 'averageRating'],
			},
		],
		order: [['id', 'DESC']],
	});
	res.status(200).json({ reviews });
};

const getSingleReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const review = await Review.findByPk(reviewId, {
		include: [
			{
				model: User,
				as: 'user',
				attributes: ['firstName', 'email'],
			},
			{
				model: Product,
				as: 'product',
				attributes: ['name', 'price', 'inventory', 'averageRating'],
			},
		],
	});
	if (!review) {
		throw new ErrorCustomError.NotFoundError('No product found');
	}
	res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const { title, comment, rating } = req.body;

	const review = await Review.findOne({
		where: {
			id: reviewId,
		},
		include: {
			model: User,
			as: 'user',
		},
	});

	if (!review) {
		throw new ErrorCustomError.NotFoundError('No review found');
	}

	checkPermissions(req.user, review.user.id);

	review.rating = rating;
	review.title = title;
	review.comment = comment;
	await review.save();

	res.status(200).json({ review });
};

const deleteReview = async (req, res) => {
	const review = await Review.findOne({
		where: {
			id: req.params.id,
		},
		include: {
			model: User,
			as: 'user',
		},
	});
	if (!review) {
		throw new CustomError.NotFoundError('Review not found.');
	}
	checkPermissions(req.user, review.user.id);
	await review.destroy();
	res.status(StatusCodes.OK).json({ msg: 'Success! Review was deleted.' });
};

const getSingleProductReviews = async (req, res) => {
	const productId = req.params.id;
	const reviews = await Review.findAndCountAll({
		where: {
			productId,
		},
	});
	if (!reviews) {
		throw new CustomError.NotFoundError('Review not found.');
	}
	res.status(200).json({ reviews });
};

module.exports = {
	createReview,
	getAllReviews,
	getSingleReview,
	updateReview,
	deleteReview,
	getSingleProductReviews,
};
