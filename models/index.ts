// @ts-nocheck

import { Sequelize, Options } from 'sequelize'
// import { UserFactory } from "./user-model";
// import { SkillsFactory } from "./skills-model";
// import { WorksheetFactory } from './worksheet';
import _ = require('lodash')
// import _ from 'lodash'
import { ScrapeFactory } from './scrape'
import { FamilyFactory } from './family'
import { CameraFactory } from './camera'
import { BlogpostFactory } from './blogpost'

import {
  AwesomeProjectFactory,
  AwesomePhotoFactory,
  AwesomeMetadataFactory,
} from './awesome'

import { SeqObject } from 'thalia'

export function datavizDBFactory(seqOptions: Options): SeqObject {
  // Initialise Sequelize
  const sequelize: Sequelize = new Sequelize(seqOptions)

  // Initialise models
  const Scrape = ScrapeFactory(sequelize)
  const Family = FamilyFactory(sequelize)
  const Camera = CameraFactory(sequelize)
  const Blogpost = BlogpostFactory(sequelize)

  const AwesomeMetadata = AwesomeMetadataFactory(sequelize)
  const AwesomePhoto = AwesomePhotoFactory(sequelize)
  const AwesomeProject = AwesomeProjectFactory(sequelize)

  AwesomeProject.hasOne(AwesomeMetadata)

  Camera.belongsTo(Family)
  Family.hasMany(Camera)

  return {
    sequelize,
    Scrape,
    Family,
    Camera,
    Blogpost,
    AwesomeProject,
    AwesomePhoto,
    AwesomeMetadata,
  }
}
