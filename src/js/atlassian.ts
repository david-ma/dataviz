import { Chart, _ } from 'chart'

console.log('hello')

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

function getFeatureState(featureName) {
  // To be implemented by you
  // this function would use fetchAllFeatures

  return new Promise((resolve) => {
    fetchAllFeatures().then(function (features) {
      return resolve(features[featureName])
    })
  })
}

// // Function usage examples
// // src/feature-x/summary.js
getFeatureState('extended-summary').then(function (isEnabled) {
  if (isEnabled) {
    console.log("extended summary is enabled")
    // showExtendedSummary();
  } else {
    console.log("showing brief summary")
    // showBriefSummary();
  }
})

// // src/feature-y/feedback-dialog.js
getFeatureState("feedback-dialog")
  .then(function(isEnabled) {
    if (isEnabled) {
      // makeFeedbackButtonVisible();
    }
  });
