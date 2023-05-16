'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Products', 'images', {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Products', 'images');
	},
};
