import { DataTypes, Sequelize } from 'sequelize'
import { BlogpostStatic } from './models'

export function BlogpostFactory (sequelize: Sequelize): BlogpostStatic {
  return <BlogpostStatic>sequelize.define('Blogpost', {
    shortname: {
      unique: true,
      type: DataTypes.STRING
    },
    title: DataTypes.STRING,
    summary: DataTypes.STRING,
    image: DataTypes.STRING,
    category: DataTypes.STRING,
    publish_date: DataTypes.DATEONLY,
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  })
}
