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
				as: 'product_variants',
			});
			Product.belongsTo(models.Company, {
				foreignKey: 'companyId',
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
			Product.hasMany(models.Review, {
				foreignKey: 'productId',
				as: 'reviews',
				onDelete: 'SET NULL',
			});
			Product.hasMany(models.OrderItem, {
				foreignKey: {
					name: 'productId',
					allowNull: false,
				},
				onDelete: 'SET NULL',
			});
		}
	}
	Product.init(
		{
			name: DataTypes.STRING,
			description: DataTypes.TEXT,
			price: DataTypes.DECIMAL,
			featured: DataTypes.BOOLEAN,
			image: DataTypes.ARRAY(DataTypes.STRING),
			inventory: DataTypes.INTEGER, // DELETE THIS ONE
			published: DataTypes.BOOLEAN,
			freeShipping: DataTypes.BOOLEAN,
			averageRating: DataTypes.FLOAT,
			numberOfReviews: DataTypes.INTEGER,
			companyId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'Product',
		}
	);
	return Product;
};
