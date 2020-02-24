'use strict';
module.exports = (sequelize, DataTypes) => {
  const Detail = sequelize.define('Detail', {
    camera: DataTypes.STRING,
    brand: DataTypes.STRING,
    detail: DataTypes.STRING
  }, {});
  Detail.associate = function(models) {
    // associations can be defined here
  };
  return Detail;
};