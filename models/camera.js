'use strict';
module.exports = (sequelize, DataTypes) => {
  const Camera = sequelize.define('Camera', {
    name: DataTypes.STRING,
    releaseDate: DataTypes.DATE,
    photo: DataTypes.STRING
  }, {});
  Camera.associate = function(models) {
    // associations can be defined here
    // models.Camera.belongsTo(models.Brand, {
    //   allowNull: false
    //   // foreignKey: 'brand'
    // });
  };
  return Camera;
};