'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Products', 'companyId', {
			type: Sequelize.INTEGER,
			references: {
				model: 'Companies',
				key: 'id',
			},
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Products', 'companyId');
	},
};
