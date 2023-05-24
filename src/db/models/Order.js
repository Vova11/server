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
		},
		{
			sequelize,
			modelName: 'Order',
		}
	);
	return Order;
};
