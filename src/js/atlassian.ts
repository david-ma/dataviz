import { Chart, _ } from 'chart'

console.log('hello')

// this is a backend system abstaction that returns the state of *all* features for current user
function fetchAllFeatures() {
  // in reality, this would have been a `fetch` call:
  // `fetch("/api/features/all")`
  return new Promise((resolve) => {
    const sampleFeatures = {
      'unknown-feature': {
        default: false,
        nav: null,
      },
      'extended-summary': {
        default: true,
      },
      'feedback-dialog': {
        default: false,
      },
    }

    setTimeout(resolve, 100, sampleFeatures)
    // throw new Error('Broken')
  })
}

let globalFeatures = {}
let globalFeaturesTimestamp = null

function getFeatureState(featureName, component = 'default') {
  const defaults = {
    'unknown-feature': {
      default: false,
    },
    'extended-summary': {
      default: true,
    },
    'feedback-dialog': {
      default: true,
    },
  }

  // To be implemented by you
  // this function would use fetchAllFeatures

  return new Promise((resolve) => {
    // if(globalFeaturesTimestamp)

    // 1) if globalFeaturesTimestamp is null, fetch it
    // 2) if globalFeaturesTimestamp is in progress, wait
    // 3) if globalFeaturesTimestamp is fresh, use it
    // 4) if globalFeaturesTimestamp is stale, fetch it

    globalFeaturesTimestamp = "inProgress"

    // Check the timestamp of the cached features
    // Use the cached features if they are less than 5 minutes old

    // if (globalFeaturesTimestamp && globalFeaturesTimestamp > Date.now() - 1000 * 60 * 5) {
    if (globalFeaturesTimestamp) {
      console.log('Using cached features')
      resolve(globalFeatures[featureName][component])
    } else {
      fetchAllFeatures()
        .catch((error) => {
          // handle error.
          // probably assume features are all disabled
          // Log the error

          resolve(defaults[featureName][component])
        })

        .then(function (features) {
          globalFeatures = features
          globalFeaturesTimestamp = true

          if (features[featureName]) {
            if (Object.keys(features[featureName]).indexOf('component') > -1) {
              return resolve(features[featureName][component])
            } else {
              return resolve(features[featureName].default)
            }
          } else {
            return resolve(defaults['unknown-feature'][component])
          }
        })
    }
  })
}




// // Function usage examples
// // src/feature-x/summary.js
getFeatureState('extended-summary', 'homepage').then(function (isEnabled) {
  if (isEnabled) {
    console.log('extended summary is enabled')
    // showExtendedSummary();
  } else {
    console.log('showing brief summary')
    // showBriefSummary();
  }
})

// // src/feature-y/feedback-dialog.js
getFeatureState('feedback-dialog').then(function (isEnabled) {
  console.log('Feedback dialog', isEnabled)

  if (isEnabled) {
    console.log('feedback dialog is enabled')
    // makeFeedbackButtonVisible();
  }
})




setTimeout(function () {
  // // src/feature-y/feedback-dialog.js
  getFeatureState('feedback-dialog').then(function (isEnabled) {
    console.log('Feedback dialog', isEnabled)

    if (isEnabled) {
      console.log('feedback dialog is enabled')
      // makeFeedbackButtonVisible();
    }
  })
}, 1000)
