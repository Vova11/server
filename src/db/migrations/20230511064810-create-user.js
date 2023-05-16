'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			firstName: {
				type: Sequelize.STRING,
			},
			lastName: {
				type: Sequelize.STRING,
			},
			email: {
				type: Sequelize.STRING,
			},
			password: {
				type: Sequelize.STRING,
			},
			role: {
				type: Sequelize.ENUM('admin', 'user'), // Specify the allowed values for ENUM
				allowNull: false,
				defaultValue: 'user',
			},
			isVerified: {
				type: Sequelize.BOOLEAN,
			},
			verified: {
				type: Sequelize.DATE,
			},
			passwordToken: {
				type: Sequelize.STRING,
			},
			passwordTokenExpirationDate: {
				type: Sequelize.DATE,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Users');
	},
};
