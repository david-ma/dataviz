"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blogpost = exports.Camera = exports.Family = exports.Scrape = exports.dbConfig = void 0;
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
const path = require("path");
// Default options
let seqOptions = {
    database: process.env.DB_NAME || 'typescript_test',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: 3306,
    dialect: 'mariadb',
    // timezone: 'Australia/Melbourne',
    dialectOptions: {
        timezone: 'Australia/Melbourne',
        decimalNumbers: true
    },
    logging: false,
    define: {
        underscored: true
    }
};
// Load options from config.json if one is provided
const env = process.env.NODE_ENV || 'development';
try {
    // const configOptions = require(__dirname + '/../config/config.json')[env]
    const configOptions = require(path.resolve(__dirname, '..', 'config', 'config.json'))[env];
    seqOptions = _.merge(seqOptions, configOptions);
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
exports.Scrape = scrape_1.ScrapeFactory(exports.dbConfig);
exports.Family = family_1.FamilyFactory(exports.dbConfig);
exports.Camera = camera_1.CameraFactory(exports.dbConfig);
exports.Blogpost = blogpost_1.BlogpostFactory(exports.dbConfig);
// export const Family = FamilyFactory(dbConfig)
// export const Worksheet = WorksheetFactory(dbConfig)
exports.Camera.belongsTo(exports.Family);
exports.Family.hasMany(exports.Camera);
