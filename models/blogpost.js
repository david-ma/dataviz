import { DataTypes } from 'sequelize';
export function BlogpostFactory(sequelize) {
    return sequelize.define('Blogpost', {
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
    });
}
//# sourceMappingURL=blogpost.js.map