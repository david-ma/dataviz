"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwesomeProjectFactory = void 0;
const sequelize_1 = require("sequelize");
function AwesomeProjectFactory(sequelize) {
    return sequelize.define('AwesomeProject', {
        name: sequelize_1.DataTypes.STRING,
        url: sequelize_1.DataTypes.STRING,
        email: sequelize_1.DataTypes.STRING,
        phone: sequelize_1.DataTypes.STRING,
        about_me: sequelize_1.DataTypes.STRING,
        about_project: sequelize_1.DataTypes.STRING,
        title: sequelize_1.DataTypes.STRING,
        funded_on: sequelize_1.DataTypes.DATEONLY,
        rss_feed_url: sequelize_1.DataTypes.STRING,
        use_for_money: sequelize_1.DataTypes.STRING,
        hidden_at: sequelize_1.DataTypes.DATE,
        hidden_reason: sequelize_1.DataTypes.STRING,
    });
}
exports.AwesomeProjectFactory = AwesomeProjectFactory;
