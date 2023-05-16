'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('ProductVariants', 'sizeId', {
			type: Sequelize.INTEGER,
			references: {
				model: 'Sizes',
				key: 'id',
			},
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('ProductVariants', 'sizeId');
	},
};
