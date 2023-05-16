'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('ProductColours');
	},

	down: async (queryInterface, Sequelize) => {
		// Add code here to recreate the table if you want to rollback the migration
		// For example, you can use queryInterface.createTable()
	},
};
