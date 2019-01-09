'use strict';
module.exports = (sequelize, DataTypes) => {
  var SheetVersion = sequelize.define('SheetVersion', {
    cells: DataTypes.JSON,
    original: DataTypes.JSON,
  }, {});
  SheetVersion.associate = function(models) {
    // associations can be defined here
  };
  return SheetVersion;
};
