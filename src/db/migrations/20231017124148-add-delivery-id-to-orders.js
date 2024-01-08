'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'deliveryId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Deliveries',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'deliveryId');
  },
};