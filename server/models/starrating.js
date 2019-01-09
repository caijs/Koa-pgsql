'use strict';
module.exports = (sequelize, DataTypes) => {
  var StarRating = sequelize.define('StarRating', {
    federalProviderNumber: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    providerName: DataTypes.STRING,
    providerState: DataTypes.STRING,
    overallRating: DataTypes.INTEGER,
    healthInspectionRating: DataTypes.INTEGER,
    qmRating: DataTypes.INTEGER,
    staffingRating: DataTypes.INTEGER,
    rnStaffingRating: DataTypes.INTEGER,
    location: DataTypes.STRING
  }, {});
  StarRating.associate = function(models) {
    // associations can be defined here
  };
  return StarRating;
};
