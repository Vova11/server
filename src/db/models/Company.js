'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Company extends Model {
		static associate(models) {
			// Define the association with the Product model
			Company.hasMany(models.Product, {
				foreignKey: 'companyId',
			});
		}
	}
	Company.init(
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'Company',
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
	return Company;
};
