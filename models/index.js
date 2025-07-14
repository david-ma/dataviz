// @ts-nocheck
import { Sequelize } from 'sequelize';
// import _ from 'lodash'
import { ScrapeFactory } from './scrape';
import { FamilyFactory } from './family';
import { CameraFactory } from './camera';
import { BlogpostFactory } from './blogpost';
import { AwesomeProjectFactory, AwesomePhotoFactory, AwesomeMetadataFactory, } from './awesome';
export function datavizDBFactory(seqOptions) {
    // Initialise Sequelize
    const sequelize = new Sequelize(seqOptions);
    // Initialise models
    const Scrape = ScrapeFactory(sequelize);
    const Family = FamilyFactory(sequelize);
    const Camera = CameraFactory(sequelize);
    const Blogpost = BlogpostFactory(sequelize);
    const AwesomeMetadata = AwesomeMetadataFactory(sequelize);
    const AwesomePhoto = AwesomePhotoFactory(sequelize);
    const AwesomeProject = AwesomeProjectFactory(sequelize);
    AwesomeProject.hasOne(AwesomeMetadata);
    Camera.belongsTo(Family);
    Family.hasMany(Camera);
    return {
        sequelize,
        Scrape,
        Family,
        Camera,
        Blogpost,
        AwesomeProject,
        AwesomePhoto,
        AwesomeMetadata,
    };
}
//# sourceMappingURL=index.js.map