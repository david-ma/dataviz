import { DataTypes, Sequelize } from 'sequelize'

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
