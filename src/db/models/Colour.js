'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Colour extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Colour.belongsToMany(models.Product, {
				through: 'ProductVariants',
				foreignKey: 'colourId',
				otherKey: 'productId',
				as: 'colour_products',
			});
			Colour.hasMany(models.ProductVariant, {
				foreignKey: 'colourId',
				as: 'variants',
			});
			// Colour.belongsToMany(models.Product, {
			// 	through: models.ProductColour,
			// 	foreignKey: 'colourId',
			// 	otherKey: 'productId',
			// 	as: 'products',
			// });
			// Colour.belongsToMany(models.Product, {
			// 	through: 'ProductVariant',
			// 	foreignKey: 'colourId',
			// });
		}
	}
	Colour.init(
		{
			name: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Colour',
			hooks: {
				beforeSave: (instance, options) => {
					instance.name = instance.name.toLowerCase();
				},
				beforeUpdate: (instance, options) => {
					instance.name = instance.name.toLowerCase();
				},
			},
		}
	);
	return Colour;
};
