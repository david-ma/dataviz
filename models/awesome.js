"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwesomeProjectFactory = exports.AwesomeProject = exports.AwesomePhotoFactory = exports.AwesomePhoto = exports.AwesomeMetadataFactory = exports.AwesomeMetadata = void 0;
const sequelize_1 = require("sequelize");
class AwesomeMetadata extends sequelize_1.Model {
}
exports.AwesomeMetadata = AwesomeMetadata;
function AwesomeMetadataFactory(sequelize) {
    return sequelize.define('AwesomeMetadata', {
        awesome_project_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        value: sequelize_1.DataTypes.JSON,
    });
}
exports.AwesomeMetadataFactory = AwesomeMetadataFactory;
class AwesomePhoto extends sequelize_1.Model {
}
exports.AwesomePhoto = AwesomePhoto;
function AwesomePhotoFactory(sequelize) {
    return sequelize.define('AwesomePhoto', {
        url: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        awesome_project_id: {
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: AwesomeProject,
                key: 'id',
            },
        },
        caption: sequelize_1.DataTypes.STRING,
        smugmug_album: sequelize_1.DataTypes.STRING,
        smugmug_key: sequelize_1.DataTypes.STRING,
        smugmug_url: sequelize_1.DataTypes.STRING,
    });
}
exports.AwesomePhotoFactory = AwesomePhotoFactory;
class AwesomeProject extends sequelize_1.Model {
}
exports.AwesomeProject = AwesomeProject;
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
