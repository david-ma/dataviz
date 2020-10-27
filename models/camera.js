"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraFactory = void 0;
const sequelize_1 = require("sequelize");
function CameraFactory(sequelize) {
    return sequelize.define("Camera", {
        identifier: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get: function () {
                return `${this.get('brand')}_${this.get('model').replace(" ", "-")}`;
            }
        },
        brand: sequelize_1.DataTypes.STRING,
        model: sequelize_1.DataTypes.STRING,
        year: sequelize_1.DataTypes.STRING,
        also_known_as: sequelize_1.DataTypes.STRING,
        aperture_priority: sequelize_1.DataTypes.STRING,
        battery: sequelize_1.DataTypes.STRING,
        built_in_flash: sequelize_1.DataTypes.STRING,
        crop_factor: sequelize_1.DataTypes.STRING,
        digital_zoom: sequelize_1.DataTypes.STRING,
        dimensions: sequelize_1.DataTypes.STRING,
        effective_megapixels: sequelize_1.DataTypes.STRING,
        exposure_compensation: sequelize_1.DataTypes.STRING,
        external_flash: sequelize_1.DataTypes.STRING,
        focal_length_35mm_equiv: sequelize_1.DataTypes.STRING,
        gps: sequelize_1.DataTypes.STRING,
        hdmi: sequelize_1.DataTypes.STRING,
        iso: sequelize_1.DataTypes.STRING,
        macro_focus_range: sequelize_1.DataTypes.STRING,
        manual_focus: sequelize_1.DataTypes.STRING,
        max_aperture: sequelize_1.DataTypes.STRING,
        max_aperture_35mm_equiv: sequelize_1.DataTypes.STRING,
        max_image_resolution: sequelize_1.DataTypes.STRING,
        max_shutter_speed: sequelize_1.DataTypes.STRING,
        megapixels: sequelize_1.DataTypes.STRING,
        metering: sequelize_1.DataTypes.STRING,
        min_shutter_speed: sequelize_1.DataTypes.STRING,
        normal_focus_range: sequelize_1.DataTypes.STRING,
        optical_zoom: sequelize_1.DataTypes.STRING,
        raw_support: sequelize_1.DataTypes.STRING,
        screen_resolution: sequelize_1.DataTypes.STRING,
        screen_size: sequelize_1.DataTypes.STRING,
        sensor_resolution: sequelize_1.DataTypes.STRING,
        sensor_size: sequelize_1.DataTypes.STRING,
        sensor_type: sequelize_1.DataTypes.STRING,
        shutter_priority: sequelize_1.DataTypes.STRING,
        storage_types: sequelize_1.DataTypes.STRING,
        total_megapixels: sequelize_1.DataTypes.STRING,
        usb: sequelize_1.DataTypes.STRING,
        video_capture: sequelize_1.DataTypes.STRING,
        viewfinder: sequelize_1.DataTypes.STRING,
        weight: sequelize_1.DataTypes.STRING,
        white_balance_presets: sequelize_1.DataTypes.STRING,
        wireless: sequelize_1.DataTypes.STRING
    }, {
        indexes: [
            {
                name: 'model',
                unique: true,
                fields: ['model', 'brand']
            }
        ]
    });
}
exports.CameraFactory = CameraFactory;
