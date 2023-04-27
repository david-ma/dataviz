"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwesomeProjectFactory = void 0;
const sequelize_1 = require("sequelize");
function AwesomeProjectFactory(sequelize) {
    return sequelize.define('AwesomeProject', {
        name: sequelize_1.DataTypes.STRING,
        title: sequelize_1.DataTypes.STRING,
        about_project: sequelize_1.DataTypes.STRING,
        use_for_money: sequelize_1.DataTypes.STRING,
        about_me: sequelize_1.DataTypes.STRING,
        url: sequelize_1.DataTypes.STRING,
        email: sequelize_1.DataTypes.STRING,
        phone: sequelize_1.DataTypes.STRING,
        chapter_name: sequelize_1.DataTypes.STRING,
        created_at: sequelize_1.DataTypes.DATE,
        funded_on: sequelize_1.DataTypes.DATEONLY,
        extra_question_1: sequelize_1.DataTypes.STRING,
        extra_answer_1: sequelize_1.DataTypes.STRING,
        extra_question_2: sequelize_1.DataTypes.STRING,
        extra_answer_2: sequelize_1.DataTypes.STRING,
        extra_question_3: sequelize_1.DataTypes.STRING,
        extra_answer_3: sequelize_1.DataTypes.STRING,
        rss_feed_url: sequelize_1.DataTypes.STRING,
        hidden_at: sequelize_1.DataTypes.DATE,
        hidden_reason: sequelize_1.DataTypes.STRING,
    }, {
        timestamps: false,
    });
}
exports.AwesomeProjectFactory = AwesomeProjectFactory;
