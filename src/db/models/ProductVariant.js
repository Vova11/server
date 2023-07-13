'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class ProductVariant extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			ProductVariant.belongsTo(models.Product, { foreignKey: 'productId' });
			ProductVariant.belongsTo(models.Colour, {
				foreignKey: 'colourId',
				as: 'colour',
			});
			ProductVariant.belongsTo(models.Size, {
				foreignKey: 'sizeId',
				as: 'size',
			});
		}
	}
	ProductVariant.init(
		{
			productId: DataTypes.INTEGER,
			colourId: DataTypes.INTEGER,
			sizeId: DataTypes.INTEGER,
			stock: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'ProductVariant',
		}
	);
	return ProductVariant;
};
