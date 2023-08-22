'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the new 'main' column to the 'Picture' table
    await queryInterface.addColumn('Colours', 'hexColourCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'main' column from the 'Picture' table if needed
    await queryInterface.removeColumn('Colours', 'hexColourCode');
  },
};