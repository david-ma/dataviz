'use strict';
module.exports = (sequelize, DataTypes) => {
    const Family = sequelize.define('Family', {
        identifier: {
            type: DataTypes.VIRTUAL,
            get: function() {
                return `${this.get('brand')}_${this.get('name').replace(" ", "-")}`
            }
        },
        brand: DataTypes.STRING,
        // camera_identifier: DataTypes.STRING,
        name: DataTypes.STRING,
        description: DataTypes.STRING
    }, {});

    Family.associate = function(models) {
        // associations can be defined here


        // console.log(">>> Running Family associations");

        models.Camera.belongsTo(models.Family, {
            // as: "family"
          //   joinTableName: 'family_camera',
          //   foreignKey: 'identifier'
        });
  



        models.Family.hasMany(models.Camera, {
            // joinTableName: 'family_camera',
            // foreignKey: 'identifier'
        });
    };

    return Family;
};
