"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogpostFactory = void 0;
const sequelize_1 = require("sequelize");
function BlogpostFactory(sequelize) {
    return sequelize.define('Blogpost', {
        shortname: {
            unique: true,
            type: sequelize_1.DataTypes.STRING
        },
        title: sequelize_1.DataTypes.STRING,
        summary: sequelize_1.DataTypes.STRING,
        image: sequelize_1.DataTypes.STRING,
        category: sequelize_1.DataTypes.STRING,
        publish_date: sequelize_1.DataTypes.DATEONLY,
        published: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
}
exports.BlogpostFactory = BlogpostFactory;
