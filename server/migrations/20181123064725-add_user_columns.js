'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'Users',
          'last_logged_in',
          {
            type: Sequelize.DATE,
            allowNull: true
          }, { transaction: t }),
          queryInterface.addColumn(
            'Users',
            'last_logged_out',
          {
            type: Sequelize.DATE,
            allowNull: true
          }, { transaction: t }),
          queryInterface.addColumn(
            'Users',
            'downloaded',
            {
              type: Sequelize.BOOLEAN,
              allowNull: true
            }, { transaction: t }),
            queryInterface.addColumn(
              'Users',
              'logged_time',
            {
              type: Sequelize.INTEGER,
              allowNull: true
            }, { transaction: t })
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn(
          'Users',
          'last_logged_in', { transaction: t }),
        queryInterface.removeColumn(
          'Users',
          'last_logged_out', { transaction: t }),
        queryInterface.removeColumn(
          'Users',
          'downloaded', { transaction: t }),
        queryInterface.removeColumn(
          'Users',
          'logged_time', { transaction: t })
      ])
    })
  }
};
