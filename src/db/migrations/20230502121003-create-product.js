'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Products', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			name: {
				type: Sequelize.STRING,
			},
			description: {
				type: Sequelize.TEXT,
			},
			price: {
				type: Sequelize.FLOAT,
			},
			image: {
				type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
				defaultValue: [],
			},
			featured: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			inventory: {
				type: Sequelize.INTEGER,
			},
			published: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			freeShipping: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			averageRating: {
				type: Sequelize.FLOAT,
				default: 0,
			},
			numberOfReviews: {
				type: Sequelize.INTEGER,
				default: 0,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Products');
	},
};
