"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwesomeProject = exports.Blogpost = exports.Camera = exports.Family = exports.Scrape = exports.dbConfig = void 0;
const sequelize = __importStar(require("sequelize"));
const _ = require("lodash");
const scrape_1 = require("./scrape");
const family_1 = require("./family");
const camera_1 = require("./camera");
const blogpost_1 = require("./blogpost");
const awesome_1 = require("./awesome");
const path = require("path");
let seqOptions = {
    "dialect": "sqlite",
    "storage": path.resolve(__dirname, 'database.sqlite'),
    logging: false,
    define: {
        underscored: true,
    },
};
const env = process.env.NODE_ENV || 'development';
console.log('env is:', env);
try {
    const configOptions = require(path.resolve(__dirname, '..', 'config', 'config.json'))[env];
    seqOptions = _.merge(seqOptions, configOptions);
    console.log("seqOptions are:", seqOptions);
}
catch (e) {
    console.error('No config.json provided for Sequelize', e);
}
if (env === 'development') {
    console.log('Initialising Sequelize with options:', seqOptions);
}
exports.dbConfig = new sequelize.Sequelize(seqOptions);
exports.Scrape = (0, scrape_1.ScrapeFactory)(exports.dbConfig);
exports.Family = (0, family_1.FamilyFactory)(exports.dbConfig);
exports.Camera = (0, camera_1.CameraFactory)(exports.dbConfig);
exports.Blogpost = (0, blogpost_1.BlogpostFactory)(exports.dbConfig);
exports.AwesomeProject = (0, awesome_1.AwesomeProjectFactory)(exports.dbConfig);
exports.Camera.belongsTo(exports.Family);
exports.Family.hasMany(exports.Camera);
