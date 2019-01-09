'use strict';
module.exports = (sequelize, DataTypes) => {
  var StaffingData = sequelize.define('StaffingData', {
    federalProviderNumber: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    providerName: DataTypes.STRING,
    providerState: DataTypes.STRING,
    staffingRating: DataTypes.INTEGER,
    rnStaffingRating: DataTypes.INTEGER,
    repCnaHPD: DataTypes.FLOAT,
    repLpnHPD: DataTypes.FLOAT,
    repRnHPD: DataTypes.FLOAT,
    repLicHPD: DataTypes.FLOAT,
    repTotalHPD: DataTypes.FLOAT,
    repPtHPD: DataTypes.FLOAT,
    expCnaHPD: DataTypes.FLOAT,
    expLpnHPD: DataTypes.FLOAT,
    expRnHPD: DataTypes.FLOAT,
    expTotalHPD: DataTypes.FLOAT,
    adjCnaHPD: DataTypes.FLOAT,
    adjLpnHPD: DataTypes.FLOAT,
    adjRnHPD: DataTypes.FLOAT,
    adjTotalHPD: DataTypes.FLOAT,
    location: DataTypes.STRING,
    processingDate: DataTypes.DATE,
  }, {});
  StaffingData.associate = function(models) {
    // associations can be defined here
  };
  return StaffingData;
};
