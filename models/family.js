"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyFactory = void 0;
const sequelize_1 = require("sequelize");
function FamilyFactory(sequelize) {
    return sequelize.define("Family", {
        identifier: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return `${this.get('brand')}_${this.get('name').replace(" ", "-")}`;
            }
        },
        brand: sequelize_1.DataTypes.STRING,
        name: sequelize_1.DataTypes.STRING,
        description: sequelize_1.DataTypes.STRING
    });
}
exports.FamilyFactory = FamilyFactory;
