'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'present', {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		});
    await queryInterface.addColumn('Orders', 'zipCode', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'houseNumber', {
      type: Sequelize.STRING,
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'present');
    await queryInterface.removeColumn('Orders', 'zipCode');
    await queryInterface.removeColumn('Orders', 'houseNumber');
  }
};
