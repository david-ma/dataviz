'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Cameras', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      also_known_as: {
        type: Sequelize.STRING
      },
      aperture_priority: {
        type: Sequelize.STRING
      },
      battery: {
        type: Sequelize.STRING
      },
      brand: {
        type: Sequelize.STRING
      },
      built_in_flash: {
        type: Sequelize.STRING
      },
      crop_factor: {
        type: Sequelize.STRING
      },
      digital_zoom: {
        type: Sequelize.STRING
      },
      dimensions: {
        type: Sequelize.STRING
      },
      effective_megapixels: {
        type: Sequelize.STRING
      },
      exposure_compensation: {
        type: Sequelize.STRING
      },
      external_flash: {
        type: Sequelize.STRING
      },
      focal_length_35mm_equiv: {
        type: Sequelize.STRING
      },
      gps: {
        type: Sequelize.STRING
      },
      hdmi: {
        type: Sequelize.STRING
      },
      iso: {
        type: Sequelize.STRING
      },
      macro_focus_range: {
        type: Sequelize.STRING
      },
      manual_focus: {
        type: Sequelize.STRING
      },
      max_aperture: {
        type: Sequelize.STRING
      },
      max_aperture_35mm_equiv: {
        type: Sequelize.STRING
      },
      max_image_resolution: {
        type: Sequelize.STRING
      },
      max_shutter_speed: {
        type: Sequelize.STRING
      },
      megapixels: {
        type: Sequelize.STRING
      },
      metering: {
        type: Sequelize.STRING
      },
      min_shutter_speed: {
        type: Sequelize.STRING
      },
      model: {
        type: Sequelize.STRING
      },
      normal_focus_range: {
        type: Sequelize.STRING
      },
      optical_zoom: {
        type: Sequelize.STRING
      },
      raw_support: {
        type: Sequelize.STRING
      },
      screen_resolution: {
        type: Sequelize.STRING
      },
      screen_size: {
        type: Sequelize.STRING
      },
      sensor_resolution: {
        type: Sequelize.STRING
      },
      sensor_size: {
        type: Sequelize.STRING
      },
      sensor_type: {
        type: Sequelize.STRING
      },
      shutter_priority: {
        type: Sequelize.STRING
      },
      storage_types: {
        type: Sequelize.STRING
      },
      total_megapixels: {
        type: Sequelize.STRING
      },
      usb: {
        type: Sequelize.STRING
      },
      video_capture: {
        type: Sequelize.STRING
      },
      viewfinder: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.STRING
      },
      white_balance_presets: {
        type: Sequelize.STRING
      },
      wireless: {
        type: Sequelize.STRING
      },
      year: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Cameras');
  }
};