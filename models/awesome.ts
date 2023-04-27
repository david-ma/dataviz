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

export function AwesomeProjectFactory (sequelize: Sequelize) {
  return sequelize.define('AwesomeProject', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    about_me: DataTypes.STRING,
    about_project: DataTypes.STRING,
    title: DataTypes.STRING,
    funded_on: DataTypes.DATEONLY,
    rss_feed_url: DataTypes.STRING,
    use_for_money: DataTypes.STRING,
    hidden_at: DataTypes.DATE,
    hidden_reason: DataTypes.STRING,
  })
}