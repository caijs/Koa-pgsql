'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    last_logged_in: DataTypes.DATE,
    last_logged_out: DataTypes.DATE,
    logged_time: DataTypes.INTEGER,
    downloaded: DataTypes.BOOLEAN,
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
