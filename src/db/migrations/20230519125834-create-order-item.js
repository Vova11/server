'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('OrderItems', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				type: Sequelize.STRING,
			},
			price: {
				type: Sequelize.FLOAT,
			},
			amount: {
				type: Sequelize.INTEGER,
			},
			orderId: {
				type: Sequelize.INTEGER,
				references: {
					model: 'Orders',
					key: 'id',
				},
				onDelete: 'SET NULL',
			},
			productId: {
				type: Sequelize.INTEGER,
				references: {
					model: 'Products',
					key: 'id',
				},
				onDelete: 'SET NULL',
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
		await queryInterface.dropTable('OrderItems');
	},
};
