"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwesomeMetadata = exports.AwesomePhoto = exports.AwesomeProject = exports.Blogpost = exports.Camera = exports.Family = exports.Scrape = exports.dbConfig = void 0;
const sequelize = require("sequelize");
// import { UserFactory } from "./user-model";
// import { SkillsFactory } from "./skills-model";
// import { WorksheetFactory } from './worksheet';
const _ = require("lodash");
// import _ from 'lodash'
const scrape_1 = require("./scrape");
const family_1 = require("./family");
const camera_1 = require("./camera");
const blogpost_1 = require("./blogpost");
const awesome_1 = require("./awesome");
const awesome_2 = require("./awesome");
const awesome_3 = require("./awesome");
const path = require("path");
// Default options
let seqOptions = {
    // Old defaults, from when mariaDB was the default
    // database: process.env.DB_NAME || 'typescript_test',
    // username: process.env.DB_USER || 'root',
    // password: process.env.DB_PASSWORD || '',
    // port: 3306,
    // dialect: 'mariadb',
    // // timezone: 'Australia/Melbourne',
    // dialectOptions: {
    //   timezone: 'Australia/Melbourne',
    //   decimalNumbers: true,
    // },
    dialect: 'sqlite',
    storage: path.resolve(__dirname, 'database.sqlite'),
    logging: false,
    define: {
        underscored: true,
    },
};
// Load options from config.json if one is provided
const env = process.env.NODE_ENV || 'development';
console.log('env is:', env);
try {
    // const configOptions = require(__dirname + '/../config/config.json')[env]
    const configOptions = require(path.resolve(__dirname, '..', 'config', 'config.json'))[env];
    seqOptions = _.merge(seqOptions, configOptions);
    console.log('seqOptions are:', seqOptions);
}
catch (e) {
    console.error('No config.json provided for Sequelize', e);
}
// Do NOT log your password on production!!!
if (env === 'development') {
    console.log('Initialising Sequelize with options:', seqOptions);
}
// Initialise Sequelize
exports.dbConfig = new sequelize.Sequelize(seqOptions);
// Initialise models
exports.Scrape = (0, scrape_1.ScrapeFactory)(exports.dbConfig);
exports.Family = (0, family_1.FamilyFactory)(exports.dbConfig);
exports.Camera = (0, camera_1.CameraFactory)(exports.dbConfig);
exports.Blogpost = (0, blogpost_1.BlogpostFactory)(exports.dbConfig);
// export const Family = FamilyFactory(dbConfig)
// export const Worksheet = WorksheetFactory(dbConfig)
exports.AwesomeProject = (0, awesome_1.AwesomeProjectFactory)(exports.dbConfig);
exports.AwesomePhoto = (0, awesome_2.AwesomePhotoFactory)(exports.dbConfig);
exports.AwesomeMetadata = (0, awesome_3.AwesomeMetadataFactory)(exports.dbConfig);
// AwesomeProject.hasMany(AwesomePhoto)
// AwesomePhoto.hasOne(AwesomeProject)
exports.AwesomeProject.hasOne(exports.AwesomeMetadata);
// AwesomeMetadata.belongsTo(AwesomeProject, { foreignKey: 'awesome_project_id', targetKey: 'id' })
// AwesomePhoto.belongsTo(AwesomeProject, { foreignKey: 'awesome_project_id', targetKey: 'id' })
// AwesomeProject.hasMany(AwesomePhoto, { foreignKey: 'awesome_project_id', sourceKey: 'id' })
exports.Camera.belongsTo(exports.Family);
exports.Family.hasMany(exports.Camera);
