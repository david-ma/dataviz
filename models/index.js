"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datavizDBFactory = void 0;
const sequelize_1 = require("sequelize");
const scrape_1 = require("./scrape");
const family_1 = require("./family");
const camera_1 = require("./camera");
const blogpost_1 = require("./blogpost");
const awesome_1 = require("./awesome");
function datavizDBFactory(seqOptions) {
    const sequelize = new sequelize_1.Sequelize(seqOptions);
    const Scrape = (0, scrape_1.ScrapeFactory)(sequelize);
    const Family = (0, family_1.FamilyFactory)(sequelize);
    const Camera = (0, camera_1.CameraFactory)(sequelize);
    const Blogpost = (0, blogpost_1.BlogpostFactory)(sequelize);
    const AwesomeMetadata = (0, awesome_1.AwesomeMetadataFactory)(sequelize);
    const AwesomePhoto = (0, awesome_1.AwesomePhotoFactory)(sequelize);
    const AwesomeProject = (0, awesome_1.AwesomeProjectFactory)(sequelize);
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
exports.datavizDBFactory = datavizDBFactory;
