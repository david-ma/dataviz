
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
            category: "#MakeoverMonday",
            summary: 'Nearly a quarter of Americans have never experienced the U.S. in a time of peace according to the Washington Post.',
            image: 'images/war.jpg',
            publish_date: '2020-02-01',
            published: true
        },{
            shortname: 'wealth',
            title: 'World Wealth',
            category: "#MakeoverMonday",
            summary: "All of the world's wealth, according to the Credit Suisse report",
            image: 'images/wealth.png',
            publish_date: '2020-02-17',
            published: true
        },{
            shortname: 'influenza',
            title: 'Influenza Surveillance Report',
            category: "#MakeoverMonday",
            summary: 'Influenza in the USA in 2018',
            image: 'images/influenza.jpg',
            publish_date: '2018-06-18',
            published: true
        },{
            shortname: 'homelessness',
            title: 'Australian homelessness',
            category: "#MakeoverMonday",
            summary: 'Housing outcomes for clients of Australian Specialist Homelessness Services',
            image: 'images/homelessness.png',
            publish_date: '2020-02-24',
            published: false
        },{
            shortname: 'kids_sleep',
            title: "Kids' sleep",
            category: "#MakeoverMonday",
            summary: 'Data from savvysleeper.org on how kids sleep',
            image: 'images/kids_sleep.png',
            publish_date: '2020-03-02',
            published: false
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