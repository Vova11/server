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
				as: 'product_pictures',
        // onDelete: 'CASCADE',
        // hooks: true, 
			});
			Product.hasMany(models.ProductVariant, {
				foreignKey: 'productId',
				as: 'product_variants',
			});
			// Product.belongsToMany(models.Colour, {
			// 	through: 'ProductVariants',
			// 	foreignKey: 'productId',
			// 	otherKey: 'colourId',
			// 	as: 'product_colours',
			// });

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
			Product.belongsTo(models.Colour, {
				foreignKey: 'colourId',
				as: 'colour',
				allowNull: true,
			});
			Product.belongsTo(models.Company, {
				foreignKey: 'companyId',
				as: 'company',
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
			image: DataTypes.ARRAY(DataTypes.STRING),
			inventory: DataTypes.INTEGER, // DELETE THIS ONE
			published: DataTypes.BOOLEAN,
			featured: DataTypes.BOOLEAN,
			freeShipping: DataTypes.BOOLEAN,
			averageRating: DataTypes.FLOAT,
			numberOfReviews: DataTypes.INTEGER,
			companyId: DataTypes.INTEGER,
			puffs: DataTypes.STRING,
			nicotineSaltQuantity: DataTypes.STRING,
			eLiquidVolume: DataTypes.STRING,
			battery: DataTypes.STRING,
			nicotine: DataTypes.BOOLEAN,
			multipack: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: 'Product',
			indexes: [
				// Index on the 'name' field
				{
					unique: true, // If you want it to be a unique index
					fields: ['name'],
				},
				// Index on the 'id' field
				{
					fields: ['id'],
				},
				// You can define more indexes here if needed
			],
		}
	);
	return Product;
};
