module.exports = FindModLabels

function FindModLabels(rekognition, imageData, callback) {
  var detectModLabelsParams = {
    Image: {
      Bytes: imageData.Body
    },
    MinConfidence: 0.5
  }
  rekognition.detectModerationLabels(detectModLabelsParams, function(err, data) {
    if (err) {
      console.log(err)
      callback(err)
    }
    callback(null, data)
  })
}