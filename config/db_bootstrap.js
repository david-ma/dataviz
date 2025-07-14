import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
import { Sequelize } from 'sequelize';
import { datavizDBFactory } from '../models';
const path = __require("path");
const _ = __require("lodash");
// Default options
let seqOptions = {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '..', 'models', 'database.sqlite'),
    logging: false,
    define: {
        underscored: true,
    },
};
// Load options from config.json if one is provided
const env = process.env.NODE_ENV || 'development';
console.debug('env is:', env);
try {
    // const configOptions = require(__dirname + '/../config/config.json')[env]
    const configOptions = require(path.resolve(__dirname, '..', 'config', 'config.json'))[env];
    seqOptions = _.merge(seqOptions, configOptions);
    // console.log('seqOptions are:', seqOptions)
}
catch (e) {
    console.error('No config.json provided for Sequelize', e);
    process.exit(1);
}
// Do NOT log your password on production!!!
if (env === 'development') {
    console.debug('Initialising Sequelize with options:', seqOptions);
}
const seq = datavizDBFactory(seqOptions);
if (false) {
    // eslint-disable-line
    seq.Family.create({
        brand: 'Nikon',
        name: 'Coolpix',
        description: 'None',
    });
}
// rebuild entire database & reload data..?
if (false) {
    // console.log('sync true, force & alter')
    // eslint-disable-line
    seq.sequelize
        .sync({
        alter: true,
        // force: true,
    })
        .then(function (d) {
        // eslint-disable-line
        // Add blog posts
        const blogposts = [
            {
                shortname: 'georgia',
                title: 'Which Georgia are you closest to?',
                category: 'interactive',
                summary: 'A simple interactive map to show which Georgia you are closest to',
                image: 'images/georgia.png',
                publish_date: '2024-04-17',
                published: true,
            },
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
                category: 'animation',
                summary: 'D3.js & maths practice by drawing breathing polygons',
                image: 'images/breathe.png',
                publish_date: '2020-11-07',
                published: true,
            },
            {
                shortname: 'AusIncome',
                title: 'Australian Income',
                category: 'charts',
                summary: 'Graphs from ATO income stats 2018',
                image: 'images/ausIncome.png',
                publish_date: '2021-08-30',
                published: true,
            },
            {
                shortname: 'matrix',
                title: 'Matrix Raining Code',
                category: 'animation',
                summary: 'The raining code from the movie The Matrix (1999)',
                image: 'images/matrix.jpg',
                publish_date: '2021-09-12',
                published: true,
            },
            {
                shortname: 'winamp',
                title: 'Winamp Animation',
                category: 'animation',
                summary: 'A simple animation, reminiscent of the old winamp visualisations',
                image: 'images/winamp.jpg',
                publish_date: '2021-09-15',
                published: true,
            },
            {
                shortname: 'earthquake',
                title: 'Melbourne Earthquake',
                category: 'animation',
                summary: 'A visualisation of the twitter activity when Melbourne had an earthquake',
                image: 'images/earthquake.jpg',
                publish_date: '2021-09-23',
                published: true,
            },
        ];
        blogposts.forEach(function (blogpost) {
            // console.log(`Adding ${blogpost.shortname}`)
            seq.Blogpost.findOne({
                where: {
                    shortname: blogpost.shortname,
                },
            }).then((entry) => {
                if (!entry) {
                    seq.Blogpost.create(blogpost);
                }
                else {
                    entry.update(blogpost);
                }
            });
        });
    });
}
exports.seq = seq;
const agrf_connection = require(path.resolve(__dirname, '..', 'config', 'config.json'))['agrf_nightly'];
const agrf_sequelize = new Sequelize(agrf_connection);
export { agrf_sequelize };
//# sourceMappingURL=db_bootstrap.js.map