import { Model, Op, Sequelize } from 'sequelize'
import { dbConfig, Blogpost, Scrape, Camera, Family } from '../models'

export interface seqObject {
  [key: string]: Model | any | Sequelize
  sequelize: Sequelize
}

const seq: seqObject = {
  sequelize: dbConfig,
  Blogpost: Blogpost,
  Scrape: Scrape,
  Camera: Camera,
  Family: Family,
}

// Family.get()
if (false) {
  // eslint-disable-line
  Camera.findAll({
    where: {
      model: {
        [Op.like]: '%Coolpix%',
      },
    },
  }).then(function (cameras) {
    Family.findOne({
      where: {
        name: 'Coolpix',
      },
    }).then((family) => {
      cameras.forEach((camera) => {
        // camera.setFamily(family);
        // camera.addFamily(family);
        // console.log(camera);
        camera.update({
          family: family,
        })
      })
    })
  })
}

if (false) {
  // eslint-disable-line
  Family.create({
    brand: 'Nikon',
    name: 'Coolpix',
    description: 'None',
  })
}

// rebuild entire database & reload data..?
if (true) {
  // eslint-disable-line
  seq.sequelize
    .sync({
      // force: true
    })
    .then(function (d) {
      // eslint-disable-line
      // Add blog posts
      const blogposts = [
        {
          shortname: 'war',
          title: 'American Wartime',
          category: '#MakeoverMonday',
          summary:
            'Nearly a quarter of Americans have never experienced the U.S. in a time of peace according to the Washington Post.',
          image: 'images/war.jpg',
          publish_date: '2020-02-01',
          published: true,
        },
        {
          shortname: 'wealth',
          title: 'World Wealth',
          category: '#MakeoverMonday',
          summary:
            "All of the world's wealth, according to the Credit Suisse report",
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
          summary:
            'Housing outcomes for clients of Australian Specialist Homelessness Services',
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
          title: 'Matrix code',
          category: 'animation',
          summary: 'The raining code from the movie The Matrix (1999)',
          image: 'images/matrix.jpg',
          publish_date: '2021-09-12',
          published: true,
        },
        {
          shortname: 'winamp',
          title: 'Winamp vis',
          category: 'animation',
          summary: 'A simple animation, reminiscent of the old winamp visualisations',
          image: 'images/winamp.jpg',
          publish_date: '2021-09-15',
          published: true,
        },
      ]

      blogposts.forEach(function (blogpost) {
        // console.log(`Adding ${blogpost.shortname}`)
        Blogpost.findOne({
          where: {
            shortname: blogpost.shortname,
          },
        }).then((entry) => {
          if (!entry) {
            Blogpost.create(blogpost)
          } else {
            entry.update(blogpost)
          }
        })
      })
    })
}

exports.seq = seq
