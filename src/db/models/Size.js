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
		}
	}
	Size.init(
		{
			name: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Size',
		}
	);
	return Size;
};
