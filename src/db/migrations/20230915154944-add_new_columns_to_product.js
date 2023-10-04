'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Products', 'puffs', {
			type: Sequelize.STRING,
		});

		await queryInterface.addColumn('Products', 'nicotineSaltQuantity', {
			type: Sequelize.STRING,
		});

		await queryInterface.addColumn('Products', 'eLiquidVolume', {
			type: Sequelize.STRING,
		});

		await queryInterface.addColumn('Products', 'battery', {
			type: Sequelize.STRING,
		});

		await queryInterface.addColumn('Products', 'nicotine', {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		});

		await queryInterface.addColumn('Products', 'multipack', {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Products', 'puffs');
		await queryInterface.removeColumn('Products', 'nicotineSaltQuantity');
		await queryInterface.removeColumn('Products', 'eLiquidVolume');
		await queryInterface.removeColumn('Products', 'battery');
		await queryInterface.removeColumn('Products', 'nicotine');
		await queryInterface.removeColumn('Products', 'multipack');
	},
};
