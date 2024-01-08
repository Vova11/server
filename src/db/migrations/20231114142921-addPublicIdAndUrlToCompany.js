// In the migration file
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Companies', 'publicId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Companies', 'url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Companies', 'publicId');
    await queryInterface.removeColumn('Companies', 'url');
  },
};
