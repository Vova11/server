'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Products', 'images');
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Products', 'image', {
			type: Sequelize.STRING,
		});
	},
};
