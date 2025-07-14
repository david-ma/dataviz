import { DataTypes } from 'sequelize';
export function FamilyFactory(sequelize) {
    return sequelize.define('Family', {
        identifier: {
            type: DataTypes.VIRTUAL,
            get: function () {
                return `${this.get('brand')}_${this.get('name').replace(' ', '-')}`;
            }
        },
        brand: DataTypes.STRING,
        // camera_identifier: DataTypes.STRING,
        name: DataTypes.STRING,
        description: DataTypes.STRING
    });
}
//# sourceMappingURL=family.js.map