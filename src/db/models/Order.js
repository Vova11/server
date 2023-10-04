'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Order extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Order.hasMany(models.OrderItem, {
				foreignKey: 'orderId',
				as: 'orderItems',
			});
		}
	}
	Order.init(
		{
			shippingFee: DataTypes.FLOAT,
			subtotal: DataTypes.FLOAT,
			total: DataTypes.FLOAT,
			status: {
				type: DataTypes.ENUM,
				values: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
				defaultValue: 'pending',
				validate: {
					isIn: [['pending', 'failed', 'paid', 'delivered', 'canceled']],
				},
			},
			clientSecret: DataTypes.STRING,
			paymentIntentId: DataTypes.STRING,
			userId: DataTypes.INTEGER,
			city: DataTypes.STRING,
			country: DataTypes.STRING,
			currAlphaCode: {
				type: DataTypes.STRING,
			},
			langCode: {
				type: DataTypes.STRING,
			},
			phone: {
				type: DataTypes.STRING,
			},
			street: {
				type: DataTypes.STRING,
			},
			msTxnId: DataTypes.STRING,
			sign: DataTypes.STRING,
			eshopId: DataTypes.STRING,
			firstName: DataTypes.STRING,
			lastName: DataTypes.STRING,
			email: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Order',
		}
	);
	return Order;
};
