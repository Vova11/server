'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Orders', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			shippingFee: {
				type: Sequelize.FLOAT,
				required: true,
				defaultValue: 0.0,
			},
			subtotal: {
				type: Sequelize.FLOAT,
				required: true,
				defaultValue: 0.0,
			},
			total: {
				type: Sequelize.FLOAT,
				required: true,
				defaultValue: 0.0,
			},
			status: {
				type: Sequelize.ENUM,
				values: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
				allowNull: false,
			},
			clientSecret: {
				type: Sequelize.STRING,
			},
			paymentIntentId: {
				type: Sequelize.STRING,
			},
			userId: {
				type: Sequelize.INTEGER,
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
		await queryInterface.dropTable('Orders');
	},
};
