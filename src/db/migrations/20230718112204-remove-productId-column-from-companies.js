'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Companies', 'productId');
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Companies', 'productId', {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: {
				model: 'Products',
				key: 'id',
			},
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	},
};
