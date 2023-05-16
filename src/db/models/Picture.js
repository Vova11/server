'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Picture extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Picture.belongsTo(models.Product, {
				foreignKey: 'productId',
				as: 'product',
				onDelete: 'CASCADE',
			});
		}
	}
	Picture.init(
		{
			url: DataTypes.STRING,
			publicId: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Picture',
		}
	);
	return Picture;
};
