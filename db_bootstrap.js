
const seq = require(`${__dirname}/models/index`);
const Camera = seq.Camera = require(`${__dirname}/models`).Camera;
const Scrape = seq.Scrape = require(`${__dirname}/models`).Scrape;
const Blogpost = seq.Blogpost = require(`${__dirname}/models`).Blogpost;

// rebuild entire database & reload data..?
if (false) {

    seq.sequelize.sync({
        // force: true
    }).then(function (d) {
        // Add blog posts
        const blogposts = [{
            shortname: 'war',
            title: 'American wartime',
            summary: '#MakeoverMonday 10-Feb-2020, Nearly a quarter of Americans have never experienced the U.S. in a time of peace according to the Washington Post.',
            image: 'images/war.jpg',
            published: '2020-02-01'
        },{
            shortname: 'wealth',
            title: 'World Wealth',
            summary: "#MakeoverMonday 17-Feb-2020, All of the world's wealth, according to the Credit Suisse report",
            image: 'images/wealth.png',
            published: '2020-02-17'
        },{
            shortname: 'influenza',
            title: 'Influenza Surveillance Report',
            summary: '#MakeoverMonday 18-June-2018, Influenza in the USA in 2018',
            image: 'images/influenza.jpg',
            published: '2018-06-18'
        },{
            shortname: 'homelessness',
            title: 'Australian homelessness',
            summary: '#MakeoverMonday 24-February-2020, Housing outcomes for clients of Australian Specialist Homelessness Services',
            image: 'images/homelessness.png',
            published: '2020-02-24'
        },{
            shortname: 'kids_sleep',
            title: "Kids' sleep",
            summary: '#MakeoverMonday 2-March-2020, data from savvysleeper.org on how kids sleep',
            image: 'images/kids_sleep.png',
            published: '2020-03-02'
        }];

        blogposts.forEach(function(blogpost){
            console.log(`Adding ${blogpost.shortname}`);
            Blogpost.findOne({
                where: {
                    shortname: blogpost.shortname
                }
            }).then((entry) => {
                if(!entry) {
                    Blogpost.create(blogpost)
                } else {
                    entry.update(blogpost);
                }
            })
        });
    });

}


exports.seq = seq;