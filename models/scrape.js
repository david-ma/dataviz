'use strict';
module.exports = (sequelize, DataTypes) => {
  const Scrape = sequelize.define('Scrape', {
    brand: DataTypes.STRING,
    title: DataTypes.STRING,
    img: DataTypes.STRING,
    year: DataTypes.STRING,
    link: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {});
  Scrape.associate = function(models) {
    // associations can be defined here
  };
  return Scrape;
};