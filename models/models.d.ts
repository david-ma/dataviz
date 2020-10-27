import { BuildOptions, Model } from "sequelize";

interface mysqlAttributes {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ScrapeAttributes extends mysqlAttributes {
    brand: string;
    title: string;
    img: string;
    year: string;
    link: string;
}
export interface ScrapeModel extends Model<ScrapeAttributes>, ScrapeAttributes { }
export class Scrape extends Model<ScrapeModel, ScrapeAttributes> { }
export type ScrapeStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): ScrapeModel;
};




export interface FamilyAttributes extends mysqlAttributes {
    identifier: string;
    brand: string;
    name: string;
    descriptoin: string;
}
export interface FamilyModel extends Model<FamilyAttributes>, FamilyAttributes { }
export class Family extends Model<FamilyModel, FamilyAttributes> { }
export type FamilyStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): FamilyModel;
};



export interface CameraAttributes extends mysqlAttributes {
    identifier: string;
    brand: string;
    model: string;
    year: string;
    also_known_as: string;
    aperture_priority: string;
    battery: string;
    built_in_flash: string;
    crop_factor: string;
    digital_zoom: string;
    dimensions: string;
    effective_megapixels: string;
    exposure_compensation: string;
    external_flash: string;
    focal_length_35mm_equiv: string;
    gps: string;
    hdmi: string;
    iso: string;
    macro_focus_range: string;
    manual_focus: string;
    max_aperture: string;
    max_aperture_35mm_equiv: string;
    max_image_resolution: string;
    max_shutter_speed: string;
    megapixels: string;
    metering: string;
    min_shutter_speed: string;
    normal_focus_range: string;
    optical_zoom: string;
    raw_support: string;
    screen_resolution: string;
    screen_size: string;
    sensor_resolution: string;
    sensor_size: string;
    sensor_type: string;
    shutter_priority: string;
    storage_types: string;
    total_megapixels: string;
    usb: string;
    video_capture: string;
    viewfinder: string;
    weight: string;
    white_balance_presets: string;
    wireless: string;
}
export interface CameraModel extends Model<CameraAttributes>, CameraAttributes { }
export class Camera extends Model<CameraModel, CameraAttributes> { }
export type CameraStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): CameraModel;
};






export interface BlogpostAttributes extends mysqlAttributes {
    shortname: string;
    title: string;
    summary: string;
    image: string;
    category: string;
    publish_date: Date;
    published: boolean;
}
export interface BlogpostModel extends Model<BlogpostAttributes>, BlogpostAttributes { }
export class Blogpost extends Model<BlogpostModel, BlogpostAttributes> { }
export type BlogpostStatic = typeof Model & {
    new(values?: object, options?: BuildOptions): BlogpostModel;
};

