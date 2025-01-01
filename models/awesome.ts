import { DataTypes, Model, Sequelize, BuildOptions } from 'sequelize'

export interface AwesomeMetadataAttributes {
  awesome_project_id: number
  value: object
}
export interface AwesomeMetadataModel
  extends Model<AwesomeMetadataAttributes>,
    AwesomeMetadataAttributes {}
export class AwesomeMetadata extends Model<
  AwesomeMetadataModel,
  AwesomeMetadataAttributes
> {
  public awesome_project_id!: number
  public value!: object
}
export type AwesomeMetadataStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): AwesomeMetadataModel
}
export function AwesomeMetadataFactory(
  sequelize: Sequelize
): AwesomeMetadataStatic {
  return <AwesomeMetadataStatic>sequelize.define('AwesomeMetadata', {
    awesome_project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: DataTypes.JSON,
  })
}
export interface AwesomePhotoAttributes {
  url: string
  awesome_project_id: number
  caption?: string
  smugmug_album?: string
  smugmug_key?: string
  smugmug_url?: string
  // error?: string
}
export interface AwesomePhotoModel
  extends Model<AwesomePhotoAttributes>,
    AwesomePhotoAttributes {}
export class AwesomePhoto extends Model<
  AwesomePhotoModel,
  AwesomePhotoAttributes
> {
  public url!: string
  public awesome_project_id!: number
  public caption!: string
  public smugmug_album!: string
  public smugmug_key!: string
  public smugmug_url!: string
  // public error!: string
}
export type AwesomePhotoStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): AwesomePhotoModel
}
export function AwesomePhotoFactory(sequelize: Sequelize): AwesomePhotoStatic {
  return <AwesomePhotoStatic>sequelize.define('AwesomePhoto', {
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    awesome_project_id: {
      type: DataTypes.INTEGER,
      references: {
        model: AwesomeProject,
        key: 'id',
      },
    },
    caption: DataTypes.STRING,
    smugmug_album: DataTypes.STRING,
    smugmug_key: DataTypes.STRING,
    smugmug_url: DataTypes.STRING,
    // error: DataTypes.TEXT,
  })
}

export interface AwesomeProjectAttributes {
  name: string
  title: string
  about_project: string
  use_for_money: string
  about_me: string
  url: string
  email: string
  phone: string
  chapter_name: string
  created_at: Date
  funded_on: Date
  extra_question_1: string
  extra_answer_1: string
  extra_question_2: string
  extra_answer_2: string
  extra_question_3: string
  extra_answer_3: string
  rss_feed_url: string
  hidden_at: Date
  hidden_reason: string
}
export interface AwesomeProjectModel
  extends Model<AwesomeProjectAttributes>,
    AwesomeProjectAttributes {}
export class AwesomeProject extends Model<
  AwesomeProjectModel,
  AwesomeProjectAttributes
> {
  public name!: string
  public title!: string
  public about_project!: string
  public use_for_money!: string
  public about_me!: string
  public url!: string
  public email!: string
  public phone!: string
  public chapter_name!: string
  public created_at!: Date
  public funded_on!: Date
  public extra_question_1!: string
  public extra_answer_1!: string
  public extra_question_2!: string
  public extra_answer_2!: string
  public extra_question_3!: string
  public extra_answer_3!: string
  public rss_feed_url!: string
  public hidden_at!: Date
  public hidden_reason!: string
}
export type AwesomeProjectStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): AwesomeProjectModel
}
export function AwesomeProjectFactory(
  sequelize: Sequelize
): AwesomeProjectStatic {
  return <AwesomeProjectStatic>sequelize.define(
    'AwesomeProject',
    {
      name: DataTypes.STRING,
      title: DataTypes.STRING,
      about_project: DataTypes.STRING,
      use_for_money: DataTypes.STRING,
      about_me: DataTypes.STRING,
      url: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      chapter_name: DataTypes.STRING,
      created_at: DataTypes.DATE,
      funded_on: DataTypes.DATEONLY,
      extra_question_1: DataTypes.STRING,
      extra_answer_1: DataTypes.STRING,
      extra_question_2: DataTypes.STRING,
      extra_answer_2: DataTypes.STRING,
      extra_question_3: DataTypes.STRING,
      extra_answer_3: DataTypes.STRING,
      rss_feed_url: DataTypes.STRING,
      hidden_at: DataTypes.DATE,
      hidden_reason: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  )
}
