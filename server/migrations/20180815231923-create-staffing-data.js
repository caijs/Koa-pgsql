'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('StaffingData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      federalProviderNumber: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      providerName: {
        type: Sequelize.STRING
      },
      providerState: {
        type: Sequelize.STRING
      },
      staffingRating: {
        type: Sequelize.INTEGER
      },
      rnStaffingRating: {
        type: Sequelize.INTEGER
      },
      repCnaHPD: {
        type: Sequelize.FLOAT,
      },
      repLpnHPD: {
        type: Sequelize.FLOAT,
      },
      repRnHPD: {
        type: Sequelize.FLOAT,
      },
      repLicHPD: {
        type: Sequelize.FLOAT,
      },
      repTotalHPD: {
        type: Sequelize.FLOAT,
      },
      repPtHPD: {
        type: Sequelize.FLOAT,
      },
      expCnaHPD: {
        type: Sequelize.FLOAT,
      },
      expLpnHPD: {
        type: Sequelize.FLOAT,
      },
      expRnHPD: {
        type: Sequelize.FLOAT,
      },
      expTotalHPD: {
        type: Sequelize.FLOAT,
      },
      adjCnaHPD: {
        type: Sequelize.FLOAT,
      },
      adjLpnHPD: {
        type: Sequelize.FLOAT,
      },
      adjRnHPD: {
        type: Sequelize.FLOAT,
      },
      adjTotalHPD: {
        type: Sequelize.FLOAT,
      },
      location: {
        type: Sequelize.STRING,
      },
      processingDate: {
        type: Sequelize.DATE,
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
    return queryInterface.dropTable('StaffingData');
  }
};
