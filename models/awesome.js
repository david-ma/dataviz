import { DataTypes, Model } from 'sequelize';
export class AwesomeMetadata extends Model {
}
export function AwesomeMetadataFactory(sequelize) {
    return sequelize.define('AwesomeMetadata', {
        awesome_project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        value: DataTypes.JSON,
    });
}
export class AwesomePhoto extends Model {
}
export function AwesomePhotoFactory(sequelize) {
    return sequelize.define('AwesomePhoto', {
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        awesome_project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // references: {
            //   model: AwesomeProject,
            //   key: 'id',
            // },
        },
        caption: DataTypes.STRING,
        smugmug_album: DataTypes.STRING,
        smugmug_key: DataTypes.STRING,
        smugmug_url: DataTypes.STRING,
        // error: DataTypes.TEXT,
    });
}
export class AwesomeProject extends Model {
}
export function AwesomeProjectFactory(sequelize) {
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
    }, {
        timestamps: false,
    });
}
//# sourceMappingURL=awesome.js.map