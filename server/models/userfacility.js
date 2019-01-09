'use strict';
module.exports = (sequelize, DataTypes) => {
  var UserFacility = sequelize.define('UserFacility', {
    userId: DataTypes.INTEGER,
    federalProviderNumber: DataTypes.STRING
  }, {});
  UserFacility.associate = function(models) {
    // associations can be defined here
  };
  return UserFacility;
};