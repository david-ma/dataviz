'use strict';
module.exports = (sequelize, DataTypes) => {
    const Family = sequelize.define('Family', {
        brand: DataTypes.STRING,
        camera_identifier: DataTypes.STRING,
        name: DataTypes.STRING,
        description: DataTypes.STRING
    }, {});

    Family.associate = function(models) {
        // associations can be defined here

// Doesn't seem to do anything...
        // Family.hasMany(models.Camera)
    };

    return Family;
};
