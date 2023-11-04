"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const lodash_1 = __importDefault(require("lodash"));
const datastore = {};
var AwesomeMetadata = require('../config/db_bootstrap').seq.AwesomeMetadata;
AwesomeMetadata.findAll({}).then((data) => {
    data.reduce((acc, d) => {
        lodash_1.default.merge(acc, d.dataValues.value);
        return acc;
    }, datastore);
});
const sequelize_1 = require("sequelize");
const config = {
    services: {
        awesome: function (res, req, db) {
            var blob = {
                projects: [],
                photos: [],
            };
            const params = new URLSearchParams(req.url.split('?')[1]);
            var date = Date.parse(params.get('date'))
                ? new Date(params.get('date'))
                : new Date(new Date().setDate(new Date().getDate() - 25));
            const whitelist = [], blacklist = [];
            const start = 234100, end = 239548;
            db.AwesomeProject.findAll({
                limit: 100,
                where: {
                    [sequelize_1.Op.or]: [
                        {
                            [sequelize_1.Op.and]: [
                                {
                                    id: {
                                        [sequelize_1.Op.gte]: start,
                                    },
                                },
                                {
                                    id: {
                                        [sequelize_1.Op.lte]: end,
                                    },
                                },
                                {
                                    id: {
                                        [sequelize_1.Op.notIn]: blacklist,
                                    },
                                },
                                {
                                    name: {
                                        [sequelize_1.Op.notLike]: '%Diana Hallare%',
                                    },
                                },
                            ],
                        },
                        {
                            id: {
                                [sequelize_1.Op.in]: whitelist,
                            },
                        },
                    ],
                },
            })
                .catch(function (err) {
                console.log('ERROR reading database', err);
                res.end(JSON.stringify(err));
            })
                .then(function (projects) {
                blob.projects = projects;
                db.AwesomePhoto.findAll({
                    where: {
                        awesome_project_id: {
                            [sequelize_1.Op.in]: projects.map((p) => p.id),
                        },
                    },
                }).then(function (photos) {
                    blob.photos = photos;
                    res.end(JSON.stringify(blob));
                });
            });
        },
    },
    sockets: {
        on: [
            {
                name: 'overwriteText',
                callback: function (socket, packet, db) {
                    console.log('packet', packet);
                    db.AwesomeMetadata.findOne({
                        where: {
                            awesome_project_id: packet.id,
                        },
                    }).then((metadata) => {
                        if (metadata) {
                            const data = metadata.dataValues;
                            lodash_1.default.merge(data.value, {
                                [packet.name]: packet.data,
                            });
                            db.AwesomeMetadata.update(data, {
                                where: {
                                    awesome_project_id: packet.id,
                                },
                            });
                        }
                        else {
                            db.AwesomeMetadata.create({
                                awesome_project_id: packet.id,
                                value: {
                                    [packet.name]: packet.data,
                                },
                            });
                        }
                    });
                    socket.broadcast.emit('overwriteText', packet);
                    lodash_1.default.merge(datastore, {
                        [packet.name]: packet.data,
                    });
                },
            },
        ],
        emit: [
            (socket, seq) => {
                socket.emit('allData', datastore);
            },
        ],
    },
};
exports.config = config;
