'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class OrderItem extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			OrderItem.belongsTo(models.Order, {
				foreignKey: 'orderId',
				as: 'order',
			});
			OrderItem.belongsTo(models.Product, {
				foreignKey: 'productId',
				as: 'products',
			});
		}
	}
	OrderItem.init(
		{
			name: DataTypes.STRING,
			price: DataTypes.FLOAT,
			amount: DataTypes.INTEGER,
			orderId: DataTypes.INTEGER,
			productId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'OrderItem',
		}
	);
	return OrderItem;
};
