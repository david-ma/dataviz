import { DataTypes } from 'sequelize';
export function ScrapeFactory(sequelize) {
    return sequelize.define('Scrape', {
        brand: DataTypes.STRING,
        title: DataTypes.STRING,
        img: DataTypes.STRING,
        year: DataTypes.STRING,
        link: {
            type: DataTypes.STRING,
            unique: true
        }
    });
}
//# sourceMappingURL=scrape.js.map