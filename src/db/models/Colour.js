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
			Colour.hasMany(models.Product, {
				foreignKey: 'colourId',
			});
			
			// this was used before through variant
			// Colour.belongsToMany(models.Product, {
			// 	through: 'ProductVariants',
			// 	foreignKey: 'colourId',
			// 	otherKey: 'productId',
			// 	as: 'colour_products',
			// });
			// Colour.hasMany(models.ProductVariant, {
			// 	foreignKey: 'colourId',
			// 	as: 'variants',
			// });
			// this was used before through variant
		}
	}
	Colour.init(
		{
			name: DataTypes.STRING,
			hexColourCode: DataTypes.STRING
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
