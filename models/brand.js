'use strict';
module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define('Brand', {
    name: DataTypes.STRING
  }, {});
  Brand.associate = function(models) {
    // associations can be defined here
        // models.Camera.belongsTo(models.Brand);

    models.Brand.hasMany(models.Camera, {
      foreignKey: {
        name: 'brand',
        allowNull: false
      }
    });
  };
  return Brand;
};