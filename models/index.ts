// @ts-nocheck

import * as sequelize from 'sequelize'
// import { UserFactory } from "./user-model";
// import { SkillsFactory } from "./skills-model";
// import { WorksheetFactory } from './worksheet';
import _ = require('lodash')
// import _ from 'lodash'
import { ScrapeFactory } from './scrape'
import { FamilyFactory } from './family'
import { CameraFactory } from './camera'
import { BlogpostFactory } from './blogpost'

import { AwesomeProjectFactory } from './awesome'
import { AwesomePhotoFactory } from './awesome'
import { AwesomeMetadataFactory } from './awesome'

import path = require('path')

// Default options
let seqOptions: sequelize.Options = {
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
}

// Load options from config.json if one is provided
const env = process.env.NODE_ENV || 'development'
console.log('env is:', env)
try {
  // const configOptions = require(__dirname + '/../config/config.json')[env]
  const configOptions = require(path.resolve(
    __dirname,
    '..',
    'config',
    'config.json'
  ))[env]
  seqOptions = _.merge(seqOptions, configOptions)

  console.log('seqOptions are:', seqOptions)
} catch (e) {
  console.error('No config.json provided for Sequelize', e)
}

// Do NOT log your password on production!!!
if (env === 'development') {
  console.log('Initialising Sequelize with options:', seqOptions)
}

// Initialise Sequelize
export const dbConfig: sequelize.Sequelize = new sequelize.Sequelize(seqOptions)

// Initialise models
export const Scrape = ScrapeFactory(dbConfig)
export const Family = FamilyFactory(dbConfig)
export const Camera = CameraFactory(dbConfig)
export const Blogpost = BlogpostFactory(dbConfig)
// export const Family = FamilyFactory(dbConfig)
// export const Worksheet = WorksheetFactory(dbConfig)

export const AwesomeProject = AwesomeProjectFactory(dbConfig)
export const AwesomePhoto = AwesomePhotoFactory(dbConfig)
export const AwesomeMetadata = AwesomeMetadataFactory(dbConfig)
// AwesomeProject.hasMany(AwesomePhoto)
// AwesomePhoto.hasOne(AwesomeProject)
AwesomeProject.hasOne(AwesomeMetadata)

Camera.belongsTo(Family)
Family.hasMany(Camera)
