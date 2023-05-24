'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Review extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Review.belongsTo(models.User, {
				foreignKey: 'userId',
				as: 'user',
				allowNull: true,
			});
			Review.belongsTo(models.Product, {
				foreignKey: 'productId',
				as: 'product',
				allowNull: true,
			});
		}
	}
	Review.init(
		{
			title: {
				type: DataTypes.STRING(100),
				allowNull: false,
				trim: true,
			},
			rating: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					min: 1,
					max: 5,
				},
			},
			comment: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize,
			modelName: 'Review',
		}
	);

	Review.prototype.calculateAverageRating = async (productId) => {
		const product = await sequelize.models.Product.findByPk(productId);
		const reviews = await product.getReviews();

		const result = reviews.map((review) => review.rating);
		const numReviews = result.length;

		if (numReviews > 0) {
			const average = (result.reduce((a, b) => a + b) / numReviews).toFixed(1);
			product.numberOfReviews = numReviews;
			product.averageRating = average;
			await product.save();
		}
	};

	Review.afterSave(async (review, options) => {
		const productId = review.productId;
		await review.calculateAverageRating(productId);
	});

	Review.afterDestroy(async (review, options) => {
		const productId = review.productId;
		await review.calculateAverageRating(productId);
	});
	return Review;
};
