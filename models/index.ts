import * as sequelize from 'sequelize';
// import { UserFactory } from "./user-model";
// import { SkillsFactory } from "./skills-model";
// import { WorksheetFactory } from './worksheet';
import _ from "lodash";
import { ScrapeFactory } from './scrape';
import { FamilyFactory } from './family';
import { CameraFactory } from './camera';
import { BlogpostFactory } from './blogpost';

// Default options
let seqOptions :sequelize.Options = {
    "database": process.env.DB_NAME || "typescript_test",
    "username": process.env.DB_USER || "root",
    "password": process.env.DB_PASSWORD || "",
    "port": 3306,
    "dialect": "mysql",
    "define": {
        "underscored": true
    }
}

// Load options from config.json if one is provided
const env = process.env.NODE_ENV || 'development';
try {
    let configOptions = require(__dirname + '/../config/config.json')[env];
    seqOptions = _.merge(seqOptions, configOptions);
} catch(e){ console.error("No config.json provided for Sequelize"); }

// Do NOT log your password on production!!!
if(env == 'development') { console.log("Initialising Sequelize with options:", seqOptions); }

// Initialise Sequelize 
export const dbConfig :sequelize.Sequelize = new sequelize.Sequelize(seqOptions);

// Initialise models
export const Scrape = ScrapeFactory(dbConfig)
export const Family = FamilyFactory(dbConfig)
export const Camera = CameraFactory(dbConfig)
export const Blogpost = BlogpostFactory(dbConfig)
// export const Family = FamilyFactory(dbConfig)
// export const Worksheet = WorksheetFactory(dbConfig)

Camera.belongsTo(Family);
Family.hasMany(Camera);
