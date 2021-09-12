"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const seq = {
    sequelize: models_1.dbConfig,
    Blogpost: models_1.Blogpost,
    Scrape: models_1.Scrape,
    Camera: models_1.Camera,
    Family: models_1.Family,
};
if (false) {
    models_1.Camera.findAll({
        where: {
            model: {
                [sequelize_1.Op.like]: '%Coolpix%',
            },
        },
    }).then(function (cameras) {
        models_1.Family.findOne({
            where: {
                name: 'Coolpix',
            },
        }).then((family) => {
            cameras.forEach((camera) => {
                camera.update({
                    family: family,
                });
            });
        });
    });
}
if (false) {
    models_1.Family.create({
        brand: 'Nikon',
        name: 'Coolpix',
        description: 'None',
    });
}
if (true) {
    seq.sequelize
        .sync({})
        .then(function (d) {
        const blogposts = [
            {
                shortname: 'war',
                title: 'American Wartime',
                category: '#MakeoverMonday',
                summary: 'Nearly a quarter of Americans have never experienced the U.S. in a time of peace according to the Washington Post.',
                image: 'images/war.jpg',
                publish_date: '2020-02-01',
                published: true,
            },
            {
                shortname: 'wealth',
                title: 'World Wealth',
                category: '#MakeoverMonday',
                summary: "All of the world's wealth, according to the Credit Suisse report",
                image: 'images/wealth.png',
                publish_date: '2020-02-17',
                published: true,
            },
            {
                shortname: 'influenza',
                title: 'Influenza Surveillance Report',
                category: '#MakeoverMonday',
                summary: 'Influenza in the USA in 2018',
                image: 'images/influenza.jpg',
                publish_date: '2018-06-18',
                published: false,
            },
            {
                shortname: 'homelessness',
                title: 'Australian homelessness',
                category: '#MakeoverMonday',
                summary: 'Housing outcomes for clients of Australian Specialist Homelessness Services',
                image: 'images/homelessness.png',
                publish_date: '2020-02-24',
                published: false,
            },
            {
                shortname: 'kids_sleep',
                title: "Kids' sleep",
                category: '#MakeoverMonday',
                summary: 'Data from savvysleeper.org on how kids sleep',
                image: 'images/kids_sleep.png',
                publish_date: '2020-03-02',
                published: false,
            },
            {
                shortname: 'breathe',
                title: 'Breathing Polygons',
                category: '',
                summary: 'D3.js & maths practice by drawing breathing polygons',
                image: 'images/breathe.png',
                publish_date: '2020-11-07',
                published: true,
            },
        ];
        blogposts.forEach(function (blogpost) {
            models_1.Blogpost.findOne({
                where: {
                    shortname: blogpost.shortname,
                },
            }).then((entry) => {
                if (!entry) {
                    models_1.Blogpost.create(blogpost);
                }
                else {
                    entry.update(blogpost);
                }
            });
        });
    });
}
exports.seq = seq;
