'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Product extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// Include the association in Product model
			Product.hasMany(models.Picture, {
				foreignKey: 'productId',
				onDelete: 'CASCADE',
				as: 'product_pictures',
			});
			Product.hasMany(models.ProductVariant, {
				foreignKey: 'productId',
				as: 'product_variant',
			});
			Product.belongsToMany(models.Colour, {
				through: 'ProductVariants',
				foreignKey: 'productId',
				otherKey: 'colourId',
				as: 'product_colours',
			});

			Product.belongsToMany(models.Size, {
				through: 'ProductVariants',
				foreignKey: 'productId',
				otherKey: 'sizeId',
				as: 'product_sizes',
			});

			Product.belongsTo(models.User, {
				foreignKey: 'userId',
				as: 'user',
				allowNull: true,
			});
		}
	}
	Product.init(
		{
			name: DataTypes.STRING,
			description: DataTypes.TEXT,
			price: DataTypes.DECIMAL,
			featured: DataTypes.BOOLEAN,
			inventory: DataTypes.INTEGER, // DELETE THIS ONE
			published: DataTypes.BOOLEAN,
			freeShipping: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: 'Product',
		}
	);
	return Product;
};
