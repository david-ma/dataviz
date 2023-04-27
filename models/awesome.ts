import { DataTypes, Sequelize } from 'sequelize'
// :name => 'Name',
// :url => 'http://example.com',
// :email => 'mail@example.com',
// :phone => '555-555-5555',
// :about_me => 'About me',
// :about_project => 'About project',
// :title => 'Title',
// :funded_on => Date.new(2012,1,1),
// :rss_feed_url => 'http://example.com/rss',
// :use_for_money => 'Fun',
// :hidden_at => Time.new(2012, 1, 2).utc,
// :hidden_reason => 'not awesome'

// name,title,about_project,use_for_money,about_me,url,email,phone,chapter_name,id,created_at,funded_on,extra_question_1,extra_answer_1,extra_question_2,extra_answer_2,extra_question_3,extra_answer_3,rss_feed_url,hidden_at,hidden_reason

export function AwesomeProjectFactory (sequelize: Sequelize) {
  return sequelize.define('AwesomeProject', {
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
  })
}