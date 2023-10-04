module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Orders', 'firstName', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'Unknown',
		});
		await queryInterface.addColumn('Orders', 'lastName', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'Unknown',
		});
		await queryInterface.addColumn('Orders', 'email', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'unknown@unkown.com',
		});
		await queryInterface.addColumn('Orders', 'city', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'Unknown',
		});
		await queryInterface.addColumn('Orders', 'country', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'Unknown',
		});
		await queryInterface.addColumn('Orders', 'currAlphaCode', Sequelize.STRING);
		await queryInterface.addColumn('Orders', 'langCode', Sequelize.STRING);
		await queryInterface.addColumn('Orders', 'phone', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: '0912123456',
		});
		await queryInterface.addColumn('Orders', 'street', {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: 'Unknown',
		});
		await queryInterface.addColumn('Orders', 'msTxnId', Sequelize.STRING);
		await queryInterface.addColumn('Orders', 'sign', Sequelize.STRING);
		await queryInterface.addColumn('Orders', 'eshopId', Sequelize.STRING);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Orders', 'city');
		await queryInterface.removeColumn('Orders', 'country');
		await queryInterface.removeColumn('Orders', 'currAlphaCode');
		await queryInterface.removeColumn('Orders', 'langCode');
		await queryInterface.removeColumn('Orders', 'phone');
		await queryInterface.removeColumn('Orders', 'street');
		await queryInterface.removeColumn('Orders', 'msTxnId');
		await queryInterface.removeColumn('Orders', 'sign');
		await queryInterface.removeColumn('Orders', 'eshopId');
		await queryInterface.removeColumn('Orders', 'firstName'); // Corrected column name
		await queryInterface.removeColumn('Orders', 'lastName'); // Corrected column name
		await queryInterface.removeColumn('Orders', 'email'); // Corrected column name
	},
};
