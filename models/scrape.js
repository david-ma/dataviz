"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapeFactory = void 0;
const sequelize_1 = require("sequelize");
function ScrapeFactory(sequelize) {
    return sequelize.define("Scrape", {
        brand: sequelize_1.DataTypes.STRING,
        title: sequelize_1.DataTypes.STRING,
        img: sequelize_1.DataTypes.STRING,
        year: sequelize_1.DataTypes.STRING,
        link: {
            type: sequelize_1.DataTypes.STRING,
            unique: true
        }
    });
}
exports.ScrapeFactory = ScrapeFactory;
