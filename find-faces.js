module.exports = FindFaces

function FindFaces(rekognition, imageData, callback) {
  var detectFacesParams = {
    Image: {
      Bytes: imageData.Body
    },
    Attributes: [
      'DEFAULT', 'ALL'
    ]
  }
  rekognition.detectFaces(detectFacesParams, function(err, data) {
    if (err) {
      callback(err)
    }
    callback(null, data)
  })
}