import { DataTypes, Sequelize } from 'sequelize';
import { ScrapeStatic } from './models';

export function ScrapeFactory (sequelize: Sequelize): ScrapeStatic {
    return <ScrapeStatic>sequelize.define("Scrape", {
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
