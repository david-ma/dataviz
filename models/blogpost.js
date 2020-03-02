'use strict';
module.exports = (sequelize, DataTypes) => {
  const Blogpost = sequelize.define('Blogpost', {
    shortname: {
        unique: true,
        type: DataTypes.STRING
    },
    title: DataTypes.STRING,
    summary: DataTypes.STRING,
    image: DataTypes.STRING,
    published: DataTypes.DATE
  }, {});
  Blogpost.associate = function(models) {
    // associations can be defined here
  };
  return Blogpost;
};