import { Thalia } from '../../../server/thalia'



// this is a backend system abstaction that returns the state of *all* features for current user
function fetchAllFeatures() {
  // in reality, this would have been a `fetch` call:
  // `fetch("/api/features/all")`
  return new Promise((resolve) => {
    const sampleFeatures = {
      'extended-summary': true,
      'feedback-dialog': false,
    }

    setTimeout(resolve, 100, sampleFeatures)
  })
}



let config: Thalia.WebsiteConfig = {
  services: {
    hello: function (res, req, db) {
      console.log('Hey atlassian, the time is ' + new Date().toString())

      res.end('Hello world!')
    },
    fetchAllFeatures: function (res, req, db) {
      // function fetchAllFeatures() {
        // in reality, this would have been a `fetch` call:
        // `fetch("/api/features/all")`
        // return new Promise((resolve) => {
          // const sampleFeatures = {
          //   'extended-summary': true,
          //   'feedback-dialog': false,
          // }
      
          // setTimeout(1000, function() {
          //   res.end(JSON.stringify(sampleFeatures))
          // })
        // })
      // }
      
    }

    // getFeatureState: function (res, req, db) {
    //   // Function usage examples
    //   // src/feature-x/summary.js
    //   getFeatureState('extended-summary').then(function (isEnabled) {
    //     if (isEnabled) {
    //       showExtendedSummary()
    //     } else {
    //       showBriefSummary()
    //     }
    //   })


    // },
  },
}

export { config }
