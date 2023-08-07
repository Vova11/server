'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the new 'main' column to the 'Picture' table
    await queryInterface.addColumn('Pictures', 'main', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'main' column from the 'Picture' table if needed
    await queryInterface.removeColumn('Pictures', 'main');
  },
};