import { DataTypes, Sequelize } from 'sequelize'
import { AwesomeProject } from '.'

// store metadata about a project
export function AwesomeMetadataFactory(sequelize: Sequelize) {
  return sequelize.define('AwesomeMetadata', {
    awesome_project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: DataTypes.JSON,
  })
}

export function AwesomePhotoFactory(sequelize: Sequelize) {
  return sequelize.define('AwesomePhoto', {
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
      }
    },
    caption: DataTypes.STRING,
    smugmug_album: DataTypes.STRING,
    smugmug_key: DataTypes.STRING,
    smugmug_url: DataTypes.STRING,
  })
}

export function AwesomeProjectFactory(sequelize: Sequelize) {
  return sequelize.define(
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
