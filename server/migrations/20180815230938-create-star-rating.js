'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('StarRatings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      federalProviderNumber: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      providerName: {
        type: Sequelize.STRING
      },
      providerState: {
        type: Sequelize.STRING
      },
      overallRating: {
        type: Sequelize.INTEGER
      },
      healthInspectionRating: {
        type: Sequelize.INTEGER
      },
      qmRating: {
        type: Sequelize.INTEGER
      },
      staffingRating: {
        type: Sequelize.INTEGER
      },
      rnStaffingRating: {
        type: Sequelize.INTEGER
      },
      location: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('StarRatings');
  }
};
