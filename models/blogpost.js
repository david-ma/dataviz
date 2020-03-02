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
    category: DataTypes.STRING,
    publish_date: DataTypes.DATE,
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
  }, {});
  Blogpost.associate = function(models) {
    // associations can be defined here
  };
  return Blogpost;
};