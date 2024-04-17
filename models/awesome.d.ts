import { Model, Sequelize, BuildOptions } from 'sequelize';
export interface AwesomeMetadataAttributes {
    awesome_project_id: number;
    value: object;
}
export interface AwesomeMetadataModel extends Model<AwesomeMetadataAttributes>, AwesomeMetadataAttributes {
}
export declare class AwesomeMetadata extends Model<AwesomeMetadataModel, AwesomeMetadataAttributes> {
    awesome_project_id: number;
    value: object;
}
export type AwesomeMetadataStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): AwesomeMetadataModel;
};
export declare function AwesomeMetadataFactory(sequelize: Sequelize): AwesomeMetadataStatic;
export interface AwesomePhotoAttributes {
    url: string;
    awesome_project_id: number;
    caption?: string;
    smugmug_album?: string;
    smugmug_key?: string;
    smugmug_url?: string;
}
export interface AwesomePhotoModel extends Model<AwesomePhotoAttributes>, AwesomePhotoAttributes {
}
export declare class AwesomePhoto extends Model<AwesomePhotoModel, AwesomePhotoAttributes> {
    url: string;
    awesome_project_id: number;
    caption: string;
    smugmug_album: string;
    smugmug_key: string;
    smugmug_url: string;
}
export type AwesomePhotoStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): AwesomePhotoModel;
};
export declare function AwesomePhotoFactory(sequelize: Sequelize): AwesomePhotoStatic;
export interface AwesomeProjectAttributes {
    name: string;
    title: string;
    about_project: string;
    use_for_money: string;
    about_me: string;
    url: string;
    email: string;
    phone: string;
    chapter_name: string;
    created_at: Date;
    funded_on: Date;
    extra_question_1: string;
    extra_answer_1: string;
    extra_question_2: string;
    extra_answer_2: string;
    extra_question_3: string;
    extra_answer_3: string;
    rss_feed_url: string;
    hidden_at: Date;
    hidden_reason: string;
}
export interface AwesomeProjectModel extends Model<AwesomeProjectAttributes>, AwesomeProjectAttributes {
}
export declare class AwesomeProject extends Model<AwesomeProjectModel, AwesomeProjectAttributes> {
    name: string;
    title: string;
    about_project: string;
    use_for_money: string;
    about_me: string;
    url: string;
    email: string;
    phone: string;
    chapter_name: string;
    created_at: Date;
    funded_on: Date;
    extra_question_1: string;
    extra_answer_1: string;
    extra_question_2: string;
    extra_answer_2: string;
    extra_question_3: string;
    extra_answer_3: string;
    rss_feed_url: string;
    hidden_at: Date;
    hidden_reason: string;
}
export type AwesomeProjectStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): AwesomeProjectModel;
};
export declare function AwesomeProjectFactory(sequelize: Sequelize): AwesomeProjectStatic;
