import { DataTypes, Sequelize } from 'sequelize';
import { FamilyStatic } from './models';

export function FamilyFactory (sequelize: Sequelize): FamilyStatic {
    return <FamilyStatic>sequelize.define("Family", {
        identifier: {
            type: DataTypes.VIRTUAL,
            get: function() {
                return `${this.get('brand')}_${this.get('name').replace(" ", "-")}`
            }
        },
        brand: DataTypes.STRING,
        // camera_identifier: DataTypes.STRING,
        name: DataTypes.STRING,
        description: DataTypes.STRING
    });
}
