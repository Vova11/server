'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Token extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Token.belongsTo(models.User, {
				foreignKey: 'userId',
				as: 'user',
			});
		}
	}
	Token.init(
		{
			refreshToken: DataTypes.STRING,
			ip: DataTypes.STRING,
			userAgent: DataTypes.STRING,
			isValid: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			userId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'Token',
		}
	);
	return Token;
};
