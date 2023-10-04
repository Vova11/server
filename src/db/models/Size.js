'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Size extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// Size.belongsToMany(models.Product, { through: 'ProductVariants' });
			// Size.belongsToMany(models.Product, {
			// 	through: 'ProductVariants',
			// 	otherKey: 'productId',
			// 	as: 'products',
			// });

			Size.belongsToMany(models.Product, {
				through: 'ProductVariants',
				foreignKey: 'sizeId',
				otherKey: 'productId',
				as: 'size_products',
			});
			Size.hasMany(models.ProductVariant, {
				foreignKey: 'sizeId',
				as: 'variants',
			});
		}
	}
	Size.init(
		{
			id: {
				type: DataTypes.INTEGER, // or another appropriate data type
				primaryKey: true, // Specify this column as the primary key
				autoIncrement: true, // If it's an auto-incrementing primary key
			},
			name: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Size',
		}
	);
	return Size;
};
