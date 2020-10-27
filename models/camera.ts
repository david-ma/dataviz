import { DataTypes, Sequelize } from 'sequelize';
import { CameraStatic } from './models';

export function CameraFactory(sequelize: Sequelize): CameraStatic {
    return <CameraStatic>sequelize.define("Camera", {
        identifier: {
            type: DataTypes.VIRTUAL,
            get: function () {
                return `${this.get('brand')}_${this.get('model').replace(" ", "-")}`
            }
        },
        brand: DataTypes.STRING,
        model: DataTypes.STRING,
        year: DataTypes.STRING,
        also_known_as: DataTypes.STRING,
        aperture_priority: DataTypes.STRING,
        battery: DataTypes.STRING,
        built_in_flash: DataTypes.STRING,
        crop_factor: DataTypes.STRING,
        digital_zoom: DataTypes.STRING,
        dimensions: DataTypes.STRING,
        effective_megapixels: DataTypes.STRING,
        exposure_compensation: DataTypes.STRING,
        external_flash: DataTypes.STRING,
        focal_length_35mm_equiv: DataTypes.STRING,
        gps: DataTypes.STRING,
        hdmi: DataTypes.STRING,
        iso: DataTypes.STRING,
        macro_focus_range: DataTypes.STRING,
        manual_focus: DataTypes.STRING,
        max_aperture: DataTypes.STRING,
        max_aperture_35mm_equiv: DataTypes.STRING,
        max_image_resolution: DataTypes.STRING,
        max_shutter_speed: DataTypes.STRING,
        megapixels: DataTypes.STRING,
        metering: DataTypes.STRING,
        min_shutter_speed: DataTypes.STRING,
        normal_focus_range: DataTypes.STRING,
        optical_zoom: DataTypes.STRING,
        raw_support: DataTypes.STRING,
        screen_resolution: DataTypes.STRING,
        screen_size: DataTypes.STRING,
        sensor_resolution: DataTypes.STRING,
        sensor_size: DataTypes.STRING,
        sensor_type: DataTypes.STRING,
        shutter_priority: DataTypes.STRING,
        storage_types: DataTypes.STRING,
        total_megapixels: DataTypes.STRING,
        usb: DataTypes.STRING,
        video_capture: DataTypes.STRING,
        viewfinder: DataTypes.STRING,
        weight: DataTypes.STRING,
        white_balance_presets: DataTypes.STRING,
        wireless: DataTypes.STRING
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
